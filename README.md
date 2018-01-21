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

## Synopsis

`ftp-srv` is an extensible FTP server solution that enables custom file systems per connection allowing the use of virtual file systems. By default, it acts like a regular FTP server. Just include it in your project and start listening.

## Features

- Passive and Active transfer support
- [Explicit](https://en.wikipedia.org/wiki/FTPS#Explicit) & [Implicit](https://en.wikipedia.org/wiki/FTPS#Implicit) TLS connections
- Extensible [file systems](#file-system) per connection
- Promise based API

## Install

```
$ npm install ftp-srv
``` 

## Quick Start

```js
const FtpSrv = require('ftp-srv');

const ftpServer = new FtpSrv('ftp://0.0.0.0:9876');

ftpServer.on('login', ({connection, username, password}, resolve, reject) => {
  // fetch credentials from database, file, or hard coded
  database.users.fetch({username, password})
  .then(() => {
    connection.on('STOR', (err, file) => console.log(`Uploaded file: ${file}`));

    resolve({
      root: '/'
    });
  })
  .catch(() => reject);
});

ftpServer.listen()
.then(() => {
  console.log('Waiting for connections!');
});
```

## API

Checkout the [Documentation](/docs).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

This software is licensed under the MIT Licence. See [LICENSE](LICENSE).

## References

- [https://cr.yp.to/ftp.html](https://cr.yp.to/ftp.html)
