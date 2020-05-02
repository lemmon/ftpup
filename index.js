const fs = require('fs')
const path = require('path')
const glob = require('./src/glob')
const ftp = require('./src/ftp')

module.exports = async (opts) => {
  try {
    // open connection
    if (opts.test) {
      console.log('> TEST MODE')
    }
    await ftp.connect({
      host: opts.host,
      username: opts.username,
      password: opts.password,
      directory: opts.remoteDir,
    })
    console.log('> connected')
    const dir = path.join(process.cwd(), opts.localDir || '.')
    // upload files
    const files = await glob({
      cwd: dir,
      ignore: opts.ignore,
    })
    for (const f of files) {
      const ff = path.join(dir, f)
      const st = fs.lstatSync(ff)
      if (st.isFile()) {
        console.log('+', f)
        if (!opts.test) await ftp.upload(ff, f)
      } else if (st.isDirectory()) {
        if (!opts.test) await ftp.mkdir(f)
      }
    }
    // purge directory
    for (const dir of opts.purge) {
      await rmdir(opts, dir, false).catch(err => {
        if (err.code !== 450) throw err
      })
    }
    // close connection
    await ftp.close()
    console.log('> done')
  } catch (err) {
    await ftp.close()
    throw err
  }
}

async function rmdir(opts, dir, includeSelf = true) {
  const list = (await ftp.list(dir)).filter(curr => !curr.name.match(/^\.+$/))
  for (const item of list) {
    const file = path.join(dir, item.name)
    if (item.type !== 'd') {
      console.log('-', file)
      if (!opts.test) await ftp.rm(file)
    } else {
      await rmdir(opts, file)
    }
  }
  if (includeSelf) {
    if (!opts.test) await ftp.rmdir(dir)
  }
}
