# FTP Uploader

Simple FTP uploader for node.js.

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
  -u, --username username
  -p, --password password
  -i, --ignore   ignore pattern

Example
  $ ftpup user@example.com
  $ ftpup public user@example.com/subfolder
  $ ftpup -i node_modules projectfolder user@example.com -p topsecret
```

## License

MIT
