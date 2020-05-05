#!/usr/bin/env node
const meow = require('meow')
const ftpup = require('./')

const cli = meow(`
  Usage
    $ ftpup [OPTION]... [SRC] [USERNAME[:PASSWORD]@]HOST[:DEST]

  Options
    -u, --username=USERNAME username
    -p, --password=PASSWORD password
    -i, --ignore=PATTERN    ignore pattern
        --purge=PATH        purge directory
        --test              perform a trial run with no changes made
    -h, --help              show this help

  Example
    $ ftpup user@example.com
    $ ftpup public user@example.com/subfolder
    $ ftpup -i node_modules projectfolder user@example.com -p topsecret
`, {
  flags: {
    username: {
      type: 'string',
      alias: 'u',
    },
    password: {
      type: 'string',
      alias: 'p',
    },
    ignore: {
      type: 'string',
      alias: 'i',
    },
    purge: {
      type: 'string',
    },
    test: {
      type: 'boolean',
    },
  },
})

const opts = {
  test: cli.flags.test,
  purge: [].concat(cli.flags.purge || []),
}

if (cli.input.length == 2) {
  Object.assign(opts, {
    localDir: cli.input[0],
  }, parseUri(cli.input[1]))
} else if (cli.input.length == 1) {
  Object.assign(opts, parseUri(cli.input[0]))
} else {
  cli.showHelp()
  process.exit(0)
}

if (cli.flags.username) opts.username = cli.flags.username
if (cli.flags.password) opts.password = cli.flags.password
if (cli.flags.ignore) opts.ignore = cli.flags.ignore

ftpup(opts).catch(err => {
  console.log('!', err.message)
})

function parseUri(uri) {
  const m = uri.match(/((([^@:]+)(:([^@]+))?)@)?([\w\.]+)(\/(\S+))?/)
  return {
    host: m[6],
    username: m[3],
    password: m[5],
    remoteDir: m[8],
  }
}
