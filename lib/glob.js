const path = require('path')
const glob = require('glob')

module.exports = (props) => (
  new Promise((resolve, reject) => {
    glob('**', {
      cwd: props.cwd || process.cwd(),
      dot: true,
      ignore: props.exclude,
    }, (err, files) => {
      if (err) return reject(err)
      resolve(files)
    })
  })
)
