# ftp-srv [![npm version](https://badge.fury.io/js/ftp-srv.svg)](https://badge.fury.io/js/ftp-srv) [![Build Status](https://travis-ci.org/stewarttylerr/ftp-srv.svg?branch=master)](https://travis-ci.org/stewarttylerr/ftp-srv)  [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

<!--[RM_DESCRIPTION]-->
> Modern, extensible FTP Server

<!--[]-->

- [Overview](#overview)
- [Features](#features)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Events](#events)
- [File System](#file-system)
- [Contributing](#contributing)
- [License](#license)

## Overview
> `ftp-srv` is designed to be easy, exensible, and modern.  
> Configuration is very minimal for a basic FTP server,
but can easily grow to fit a larger scale project.

## Features
- Supports passive and active connections
- Allows extensible [file systems](#file-system) on a per connection basis

## Install
`npm install ftp-srv --save`  

## Usage

```js
// Quick start

const FtpSvr = require('ftp-srv');
const ftpServer = new FtpSvr(url, [{ options ... }]);

ftpServer.on('...', (data, resolve, reject) => { ... })

ftpServer.listen()
.then(() => { ... });
```

## API

#### new FtpSrv(url, [options])

- ##### url :: `ftp://127.0.0.1:21`
  - A full href url, indicating the protocol, and external IP with port to listen for connections.
  - Supported protocols:
    - `ftp`
  - To accept external connections, the hostname must be the box's external IP address. This can be fetched automatically by setting the hostname to `0.0.0.0`.
- ##### options :: `{}`
  - __pasv_range__ :: `22`
    - Starting port or min - max range to accept passive connections
      - Ports will be queried for an unused port in the range to use for the connection.
      - If none are found, the connection cannot be established
    - If an integer is supplied: will indicate the minimum allowable port
    - If a range is defined (`3000-3100`): only ports within that range will be used
  - __anonymous__ :: `false`
    - If true, will authenticate connections after passing the `USER` command. Passwords will not be required.
  - __blacklist__ :: `[]`
    - Array of commands to be blacklisted globally
      - `['RMD', 'RNFR', 'RNTO']`
    - A connection sending one of these commands will be replied with code `502`
  - __whitelist__ :: `[]`
    - If set, only commands within this array are allowed
    - A connection sending any other command will be replied to with code `502`
  - __file_format__ :: `ls`
    - Set the format to use for file stat queries, such as `LIST`
    - Possible values include:
      - `ls` : [bin/ls format](https://cr.yp.to/ftp/list/binls.html)  
      - `ep` : [Easily Parsed LIST format](https://cr.yp.to/ftp/list/eplf.html)  
      - Function : pass in a function as the parameter to use your own
        - Only one argument is passed in: a node [file stat](https://nodejs.org/api/fs.html#fs_class_fs_stats) object with additional file `name` parameter
  - __log__ :: `bunyan.createLogger()`
    - A [bunyan logger](https://github.com/trentm/node-bunyan) instance
    - By default, one is created, but a custom instance can be passed in as well

## Events

#### "login" ({connection, username, password}, resolve, reject)
> Occurs after `PASS` command is set, or after `USER` if `anonymous` is `true`

- ##### connection
  - Instance of the FTP client
- ##### username
  - Username provided in the `USER` command
- ##### password
  - Password provided in the `PASS` command
  - Only provided if `anonymous` is set to `false`
- #### resolve ([{fs, cwd, blacklist, whitelist}])
  - __fs__ _[optional]_
    - Optional file system class for connection to use
    - See [File System](#file-system) for implementation details
  - __cwd__ _[optional]_
    - If `fs` not provided, will set the starting directory for the connection
  - __blacklist__ _[optional]_
    - Commands that are forbidden for this connection only
  - __whitelist__ _[optional]_
    - If set, this connection will only be able to use the provided commands
- #### reject (error)
  - __error__
    - Error object

## File System
> The default file system can be overriden to use your own implementation. This can allow for virtual file systems and more.  
> Each connection can be given it's own file system depending on the user.

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

`getUniqueName()`
> Return a unique file name to write to

> Used in `STOU`

<!--[RM_CONTRIBUTING]-->
## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).


<!--[]-->

<!--[RM_LICENSE]-->
## License

This software is licensed under the MIT Licence. See [LICENSE](LICENSE).

<!--[]-->
