# FTP Uploader

Simple FTP uploader for node.js.

[![npm version](https://badge.fury.io/js/ftpup.svg)](https://badge.fury.io/js/ftpup)

## Install

This package is meant to be installed globally.

```sh
npm install ftpup --global
```

## CLI

```
Usage
  $ ftpup [OPTION]... [SRC] [USERNAME[:PASSWORD]@]HOST[:DEST]

Options
  -u, --username=USERNAME  username
  -p, --password=PASSWORD  password
      --secure             explicit ftps over tls
      --allow-unauthorized allow invalid certificates
      --exclude=PATTERN    exclude pattern
      --purge=PATH         purge directory
      --scope=SCOPE        scope name
      --fresh              ignore server state, perform fresh upload
      --test               perform a trial run with no changes made
  -v, --version            show version number
  -h, --help               show this help

Example
  $ ftpup user@example.com
  $ ftpup public user@example.com/subfolder
  $ ftpup --exclude node_modules projectfolder user@example.com -p topsecret
```

## License

MIT
