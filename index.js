const fs = require('fs')
const path = require('path')
const ftp = require('basic-ftp')
const glob = require('./lib/glob')

const client = new ftp.Client()

module.exports = async (opts) => {
  try {
    // state
    const state = {}
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
    await client.cd(remoteDir)
    // upload files
    const files = await glob({
      cwd: localDir,
      ignore: opts.ignore,
    })
    for (const file of files) {
      const ff = path.join(localDir, file)
      const st = fs.lstatSync(ff)
      if (st.isFile()) {
        console.log('+', file)
        if (!opts.test) {
          const dir = path.dirname(file)
          if (dir !== state.dir) {
            await client.cd(path.join(remoteDir, dir))
            state.dir = dir
          }
          await client.uploadFrom(ff, path.basename(file))
        }
      } else if (st.isDirectory()) {
        if (!opts.test) {
          await client.cd(remoteDir)
          await client.ensureDir(file)
          state.dir = file
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
