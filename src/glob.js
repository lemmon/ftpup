const path = require('path')
const glob = require('glob')

module.exports = (props) => {
  return new Promise((resolve, reject) => {
    glob('**', {
      cwd: props.cwd || process.cwd(),
      dot: true,
      ignore: props.ignore,
    }, (err, files) => {
      if (err) return reject(err)
      resolve(files)
    })
  })
}
