# ftp-srv [![npm version](https://badge.fury.io/js/ftp-srv.svg)](https://badge.fury.io/js/ftp-srv) [![Build Status](https://travis-ci.org/stewarttylerr/ftp-srv.svg?branch=master)](https://travis-ci.org/stewarttylerr/ftp-srv)  [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)


<!--[RM_DESCRIPTION]-->
> Modern, extensible FTP Server

<!--[]-->

- [Features](#features)
- [Install](#install)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features
- Supports passive and active connections
- Extensible [file system](#file-system)

## Install

`npm install ftp-srv --save`

`yarn add ftp-srv`

## Usage
- [Options](#options)
- [Events](#events)
- [File System](#file-system)

```js
const FtpSvr = require('ftp-srv');
const ftpServer = new FtpSvr({ [options] ... });

ftpServer.on('...', (data, resolve, reject) => { ... })

ftpServer.listen()
.then(() => { ... });
```

### Options
__url__ : `ftp://127.0.0.1:21`
> Host and port to listen on and make passive connections to.  
Set the hostname to "0.0.0.0" to fetch the external IP automatically: `ftp://0.0.0.0:21`

__pasv_range__ : `22`
> Minimum port or range to use for passive connections.  
Provide either a starting integer (`1000`) or a range (`1000-2000`).

__anonymous__ : `false`
> Set whether a valid username or password combination is required.  
If true, will not require the `PASS` command to be sent for login.

__blacklist__ : `[]`
> Commands listed will not be allowed.  
`['RMD', 'RNFR', 'RNTO']`

__whitelist__ : `[]`
> If set, no other commands are allowed except for those explicitly listed.  
`['USER', 'PASS', 'PWD']`

__file_format__ : `ls`
> Format to use for [file stat](https://nodejs.org/api/fs.html#fs_class_fs_stats) responses (such as with the `LIST` command).  
Possible values:
- `ls` : [bin/ls format](https://cr.yp.to/ftp/list/binls.html)
- `ep` : [Easily Parsed LIST format](https://cr.yp.to/ftp/list/eplf.html)
- `function` : pass in your own format function, returning a string:  
`function (fileStats) { ... }`

__log__ : `bunyan`
> A [bunyan logger](https://github.com/trentm/node-bunyan) instance.

### Events
All events emit the same structure: `({data object}, resolve, reject)`

__login__ : `{connection, username, password}`
> Occurs after `PASV` (or `USER` if `options.anonymous`)  
```
resolve({
  fs, // [optional] custom file system class
  cwd, // [optional] initial working directory (if not using custom file system),
  blacklist, // [optional] commands to forbid for this connection only
  whitelist // [optional] if set, only these commands are allowed for this connection only
})
```  

### File System
The file system can be overridden to use your own custom class. This an allow for interacting with files without actually writing them.  

*Anytime a [file stat](https://nodejs.org/api/fs.html#fs_class_fs_stats) object is used, it must have added `name` property with the file's name.*

#### Functions
`currentDirectory()`  
> Returns a string of the current working directory

> Used in: `PWD`

`get(fileName)`
> Returns a file stat object of file or directory

> Used in: `STAT`, `SIZE`, `RNFR`, `MDTM`

`list(path)`
> Returns array of file and directory stat objects

> Used in `LIST`, `STAT`

`chdir(path)`
> Returns new directory relative to cwd

> Used in `CWD`, `CDUP`

`mkdir(path)`
> Return a path to a newly created directory

> Used in `MKD`

`write(fileName, options)`
> Returns a writable stream   
Options:  
`append` if true, append to existing file

> Used in `STOR`, `APPE`

`read(fileName)`
> Returns a readable stream

> Used in `RETR`

`delete(path)`
> Delete a file or directory

> Used in `DELE`

`rename(from, to)`
> Rename a file or directory

> Used in `RNFR`, `RNTO`

`chmod(path)`
> Modify a file or directory's permissions

> Used in `SITE CHMOD`

<!--[RM_CONTRIBUTING]-->
## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).


<!--[]-->

<!--[RM_LICENSE]-->
## License

This software is licensed under the MIT Licence. See [LICENSE](LICENSE).

<!--[]-->
