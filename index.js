const fs = require('fs')
const path = require('path')
const glob = require('./src/glob')
const ftp = require('./src/ftp')

module.exports = async (opts) => {
  try {
    if (!opts.test) {
      await ftp.connect({
        host: opts.host,
        username: opts.username,
        password: opts.password,
        directory: opts.remoteDir,
      })
      console.log('> connected')
    } else {
      console.log('> TEST MODE')
    }
    const dir = path.join(process.cwd(), opts.localDir || '.')
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
    if (!opts.test) await ftp.close()
    console.log('done')
  } catch (err) {
    if (!opts.test) await ftp.close()
    throw err
  }
}
