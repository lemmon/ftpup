const fs = require('fs')
const path = require('path')
const stream = require('stream')
const ftp = require('basic-ftp')
const glob = require('./lib/glob')

const client = new ftp.Client()

module.exports = async (opts) => {
  try {
    // state
    const state = {
      local: new Map,
    }
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
    // remote state
    try {
      await client.cd(remoteDir)
      const ws = new WS
      await client.downloadTo(ws, '.ftpup')
      state.remote = new Map(ws.getJSON())
      state.toRemove = new Set(state.remote.keys())
    } catch (e) {
      state.remote = new Map()
      state.toRemove = new Set()
    }
    // upload files
    const files = await glob({
      cwd: localDir,
      exclude: opts.exclude,
    })
    for (const file of files) {
      const ff = path.join(localDir, file)
      const st = fs.lstatSync(ff)
      state.local.set(file, st.mtimeMs)
      state.toRemove.delete(file)
      if (st.isFile()) {
        if (st.mtimeMs <= state.remote.get(file)) continue
        console.log('+', 'F', file)
        if (opts.test) continue
        const dir = path.dirname(file)
        if (dir !== state.dir) {
          await client.cd(path.join(remoteDir, dir))
          state.dir = dir
        }
        await client.uploadFrom(ff, path.basename(file))
      } else if (st.isDirectory()) {
        if (state.remote.has(file)) continue
        console.log('+', 'D', file)
        if (opts.test) continue
        await client.cd(remoteDir)
        await client.ensureDir(file)
        state.dir = file
      }
    }
    // remove files
    if (!opts.test) {
      await client.cd(remoteDir)
    }
    for (const file of state.toRemove) {
      console.log('-', 'F', file)
      if (!opts.test) {
        await client.remove(file).catch(err => {
          if (err.code === 550) return
          throw err
        })
      }
    }
    // remove directories
    if (!opts.test) {
      await client.cd(remoteDir)
    }
    const toRemove = new Set(
      Array.from(state.toRemove)
        .sort((a, b) => b.split('/').length - a.split('/').length)
    )
    for (const dir of toRemove) {
      if (opts.test || dir === '.') continue
      if (state.local.has(dir)) continue
      const list = await client.list(dir).catch(err => {
        if (err.code === 450 || err.code === 550) return
        throw err
      })
      if (list === undefined || list.length) continue
      console.log('-', 'D', dir)
      await client.removeDir(path.join(remoteDir, dir))
      toRemove.add(dir)
    }
    // purge directory
    for (const dir of opts.purge) {
      console.log('-', '*', path.join(dir, '*'))
      if (!opts.test) {
        await client.cd(path.join(remoteDir, dir)).then(() => (
          client.clearWorkingDir()
        )).catch(err => {
          if (err.code === 550) return
          throw err
        })
      }
    }
    if (!opts.test) {
      await client.cd(remoteDir)
      const rs = new stream.Readable
      rs.push(JSON.stringify(Array.from(state.local)))
      rs.push(null)
      await client.uploadFrom(rs, '.ftpup')
    }
    // close connection
    await client.close()
    console.log('> done')
  } catch (err) {
    await client.close()
    throw err
  }
}

class WS extends stream.Writable {
  str = ''
  _write(chunk, encoding, cb) {
    this.str += chunk.toString()
    cb()
  }
  getString() {
    return this.str
  }
  getJSON() {
    return JSON.parse(this.str)
  }
}
