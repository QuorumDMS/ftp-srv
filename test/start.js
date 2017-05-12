require('dotenv').load();
const bunyan = require('bunyan');

const FtpServer = require('../src');

const log = bunyan.createLogger({name: 'test'});
log.level('trace');
const server = new FtpServer('ftp://127.0.0.1:8880', {
  log,
  pasv_range: 8881,
  greeting: ['Welcome', 'to', 'the', 'jungle!'],
  tls: {
    key: `${process.cwd()}/test/cert/server.key`,
    cert: `${process.cwd()}/test/cert/server.crt`,
    ca: `${process.cwd()}/test/cert/server.csr`
  },
  file_format: 'ep'
});
server.on('login', ({username, password}, resolve, reject) => {
  if (username === 'test' && password === 'test' || username === 'anonymous') {
    resolve({ root: require('os').homedir() });
  } else reject('Bad username or password');
});
server.listen();
