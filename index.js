const fs = require('fs')
const path = require('path')
const ftp = require('basic-ftp')
const glob = require('./lib/glob')

const client = new ftp.Client()

module.exports = async (opts) => {
  try {
    // open connection
    if (opts.test) {
      console.log('> TEST MODE')
    }
    await client.access({
      host: opts.host,
      user: opts.username,
      password: opts.password,
    })
    console.log('> connected')
    // directories
    const localDir = path.join(process.cwd(), opts.localDir || '.')
    const remoteDir = path.join('/', opts.remoteDir || '.')
    // upload files
    const files = await glob({
      cwd: localDir,
      ignore: opts.ignore,
    })
    for (const f of files) {
      const ff = path.join(localDir, f)
      const st = fs.lstatSync(ff)
      if (st.isFile()) {
        console.log('+', f)
        if (!opts.test) {
          await client.uploadFrom(ff, path.basename(f))
        }
      } else if (st.isDirectory()) {
        if (!opts.test) {
          await client.cd(remoteDir)
          await client.ensureDir(f)
        }
      }
    }
    // purge directory
    for (const dir of opts.purge) {
      console.log('-', path.join(dir, '*'))
      if (!opts.test) {
        await client.cd(path.join(remoteDir, dir)).catch(err => {
          if (err.code === 550) return
          throw err
        })
        await client.clearWorkingDir()
      }
    }
    // close connection
    await client.close()
    console.log('> done')
  } catch (err) {
    await client.close()
    throw err
  }
}
