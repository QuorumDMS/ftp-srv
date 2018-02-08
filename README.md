<p align="center">
  <a href="https://github.com/trs/ftp-srv">
    <img alt="ftp-srv" src="logo.png" width="600px"  />
  </a>
</p>


<p align="center">
  Modern, extensible FTP Server
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ftp-srv">
    <img alt="npm" src="https://img.shields.io/npm/dm/ftp-srv.svg?style=for-the-badge" />
  </a>

  <a href="https://circleci.com/gh/trs/ftp-srv">
    <img alt="npm" src="https://img.shields.io/circleci/project/github/trs/ftp-srv.svg?style=for-the-badge" />
  </a>

  <a href="https://coveralls.io/github/trs/ftp-srv?branch=master">
    <img alt="npm" src="https://img.shields.io/coveralls/github/trs/ftp-srv.svg?style=for-the-badge" />
  </a>
</p>

---

- [Overview](#overview)
- [Features](#features)
- [Install](#install)
- [Usage](#usage)
  - [API](#api)
  - [Events](#events)
  - [Supported Commands](#supported-commands)
  - [File System](#file-system)
- [Contributing](#contributing)
- [License](#license)

## Overview
`ftp-srv` is a modern and extensible FTP server designed to be simple yet configurable.

## Features
- Extensible [file systems](#file-system) per connection
- Passive and active transfers
- [Explicit](https://en.wikipedia.org/wiki/FTPS#Explicit) & [Implicit](https://en.wikipedia.org/wiki/FTPS#Implicit) TLS connections
- Promise based API

## Install
`npm install ftp-srv --save`  

## Usage

```js
// Quick start

const FtpSrv = require('ftp-srv');
const ftpServer = new FtpSrv('ftp://0.0.0.0:9876', { options ... });

ftpServer.on('login', (data, resolve, reject) => { ... });
...

ftpServer.listen()
.then(() => { ... });
```

## API

### `new FtpSrv(url, [{options}])`
#### url
[URL string](https://nodejs.org/api/url.html#url_url_strings_and_url_objects) indicating the protocol, hostname, and port to listen on for connections.  
Supported protocols:
- `ftp` Plain FTP
- `ftps` Implicit FTP over TLS  

_Note:_ The hostname must be the external IP address to accept external connections. Setting the hostname to `0.0.0.0` will automatically set the external IP.  
__Default:__ `"ftp://127.0.0.1:21"`

#### options

##### `pasv_range`
A starting port (eg `8000`) or a range (eg `"8000-9000"`) to accept passive connections.  
This range is then queried for an available port to use when required.  
__Default:__ `22`

##### `greeting`
A human readable array of lines or string to send when a client connects.  
__Default:__ `null`

##### `tls`
Node [TLS secure context object](https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options) used for implicit (`ftps` protocol) or explicit (`AUTH TLS`) connections.  
__Default:__ `false`

##### `anonymous`
If true, will allow clients to authenticate using the username `anonymous`, not requiring a password from the user.  
Can also set as a string which allows users to authenticate using the username provided.  
The `login` event is then sent with the provided username and `@anonymous` as the password.  
__Default:__ `false`

##### `blacklist`
Array of commands that are not allowed.  
Response code `502` is sent to clients sending one of these commands.  
__Example:__ `['RMD', 'RNFR', 'RNTO']` will not allow users to delete directories or rename any files.  
__Default:__ `[]`

##### `whitelist`
Array of commands that are only allowed.  
Response code `502` is sent to clients sending any other command.  
__Default:__ `[]`

##### `file_format`
Sets the format to use for file stat queries such as `LIST`.  
__Default:__ `"ls"`  
__Allowable values:__
  - `ls` [bin/ls format](https://cr.yp.to/ftp/list/binls.html)
  - `ep` [Easily Parsed LIST format](https://cr.yp.to/ftp/list/eplf.html)
  - `function () {}` A custom function returning a format or promise for one.
    - Only one argument is passed in: a node [file stat](https://nodejs.org/api/fs.html#fs_class_fs_stats) object with additional file `name` parameter

##### `log`
A [bunyan logger](https://github.com/trentm/node-bunyan) instance. Created by default.

## Events

The `FtpSrv` class extends the [node net.Server](https://nodejs.org/api/net.html#net_class_net_server). Some custom events can be resolved or rejected, such as `login`.

### `login`
```js
on('login', ({connection, username, password}, resolve, reject) => { ... });
```

Occurs when a client is attempting to login. Here you can resolve the login request by username and password.

`connection` [client class object](src/connection.js)  
`username` string of username from `USER` command  
`password` string of password from `PASS` command  
`resolve` takes an object of arguments:
- `fs`
  - Set a custom file system class for this connection to use.
  - See [File System](#file-system) for implementation details.
- `root`
  - If `fs` is not provided, this will set the root directory for the connection.
  - The user cannot traverse lower than this directory.
- `cwd`
  - If `fs` is not provided, will set the starting directory for the connection
  - This is relative to the `root` directory.
- `blacklist`
  - Commands that are forbidden for only this connection
- `whitelist`
  - If set, this connection will only be able to use the provided commands

`reject` takes an error object

### `client-error`
```js
on('client-error', ({connection, context, error}) => { ... });
```

Occurs when an error arises in the client connection.

`connection` [client class object](src/connection.js)  
`context` string of where the error occured  
`error` error object

### `RETR`
```js
on('RETR', (error, filePath) => { ... });
```

Occurs when a file is downloaded.

`error` if successful, will be `null`
`filePath` location to which file was downloaded

### `STOR`
```js
on('STOR', (error, fileName) => { ... });
```

Occurs when a file is uploaded.

`error` if successful, will be `null`
`fileName` name of the file that was downloaded

## Supported Commands

See the [command registry](src/commands/registration) for a list of all implemented FTP commands.

## File System
The default [file system](src/fs.js) can be overwritten to use your own implementation.  
This can allow for virtual file systems, and more.  
Each connection can set it's own file system based on the user.  

The default file system is exported and can be extended as needed:
```js
const {FtpSrv, FileSystem} = require('ftp-srv');

class MyFileSystem extends FileSystem {
  constructor() {
    super(...arguments);
  }

  get(fileName) {
    ...
  }
}
```

Custom file systems can implement the following variables depending on the developers needs:

### Methods
#### [`currentDirectory()`](src/fs.js#L29)
Returns a string of the current working directory  
__Used in:__ `PWD`

#### [`get(fileName)`](src/fs.js#L33)  
Returns a file stat object of file or directory  
__Used in:__ `LIST`, `NLST`, `STAT`, `SIZE`, `RNFR`, `MDTM`

#### [`list(path)`](src/fs.js#L39)  
Returns array of file and directory stat objects  
__Used in:__ `LIST`, `NLST`, `STAT`

#### [`chdir(path)`](src/fs.js#L56)  
Returns new directory relative to current directory  
__Used in:__ `CWD`, `CDUP`

#### [`mkdir(path)`](src/fs.js#L96)  
Returns a path to a newly created directory  
__Used in:__ `MKD`

#### [`write(fileName, {append, start})`](src/fs.js#L68)  
Returns a writable stream   
Options:  
 `append` if true, append to existing file  
 `start` if set, specifies the byte offset to write to  
__Used in:__ `STOR`, `APPE`

#### [`read(fileName, {start})`](src/fs.js#L75)
Returns a readable stream  
Options:  
 `start` if set, specifies the byte offset to read from  
__Used in:__ `RETR`

#### [`delete(path)`](src/fs.js#L87)
Delete a file or directory  
__Used in:__ `DELE`

#### [`rename(from, to)`](src/fs.js#L102)
Renames a file or directory  
__Used in:__ `RNFR`, `RNTO`

#### [`chmod(path)`](src/fs.js#L108)  
Modifies a file or directory's permissions  
__Used in:__ `SITE CHMOD`

#### [`getUniqueName()`](src/fs.js#L113)
Returns a unique file name to write to  
__Used in:__ `STOU`

<!--[RM_CONTRIBUTING]-->
## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).


<!--[]-->

<!--[RM_LICENSE]-->
## License

This software is licensed under the MIT Licence. See [LICENSE](LICENSE).

<!--[]-->

## References

- [https://cr.yp.to/ftp.html](https://cr.yp.to/ftp.html)
