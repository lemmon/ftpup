const Ftp = require('ftp')
const ftp = new Ftp()

module.exports.connect = (props) => (
  new Promise((resolve, reject) => {
    ftp.on('ready', () => {
      if (props.directory) {
        ftp.cwd(props.directory, (err) => {
          if (err) return reject(err)
          resolve()
        })
      } else {
        resolve()
      }
    })
    ftp.on('error', (err) => {
      reject(err)
    })
    ftp.connect({
      host: props.host,
      user: props.username,
      password: props.password,
    })
  })
)

module.exports.close = () => (
  ftp.end()
)

module.exports.list = (dir) => (
  new Promise((resolve, reject) => {
    ftp.list(dir, (err, list) => {
      if (err) return reject(err)
      resolve(list)
    })
  })
)

module.exports.rm = (dir) => (
  new Promise((resolve, reject) => {
    ftp.delete(dir, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
)

module.exports.mkdir = (dir) => (
  new Promise((resolve, reject) => {
    ftp.mkdir(dir, true, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
)

module.exports.rmdir = (dir) => (
  new Promise((resolve, reject) => {
    ftp.rmdir(dir, true, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
)

module.exports.upload = (local, remote) => (
  new Promise((resolve, reject) => {
    ftp.put(local, remote, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
)
