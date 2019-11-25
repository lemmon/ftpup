const fs = require('fs')
const path = require('path')
const glob = require('./src/glob')
const ftp = require('./src/ftp')

module.exports = async (opts) => {
  try {
    await ftp.connect({
      host: opts.host,
      username: opts.username,
      password: opts.password,
      directory: opts.remoteDir,
    })
    console.log('connected')
    const dir = path.join(process.cwd(), opts.localDir || '.')
    const files = await glob({
      cwd: dir,
      ignore: opts.ignore,
    })
    for (const f of files) {
      const ff = path.join(dir, f)
      const st = fs.lstatSync(ff)
      if (st.isFile()) {
        console.log('F', f)
        await ftp.upload(ff, f)
      } else if (st.isDirectory()) {
        console.log('D', f)
        await ftp.mkdir(f)
      }
    }
    await ftp.close()
    console.log('done')
  } catch (err) {
    await ftp.close()
    throw err
  }
}
