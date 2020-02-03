const bunyan = require('bunyan');
const fs = require('fs');
const FtpServer = require('../src');

const server = new FtpServer({
  log: bunyan.createLogger({name: 'test', level: 'trace'}),
  url: 'ftp://127.0.0.1:8880',
  pasv_url: '192.168.1.1',
  pasv_min: 8881,
  greeting: ['Welcome', 'to', 'the', 'jungle!'],
  tls: {
    key: fs.readFileSync(`${process.cwd()}/test/cert/server.key`),
    cert: fs.readFileSync(`${process.cwd()}/test/cert/server.crt`),
    ca: fs.readFileSync(`${process.cwd()}/test/cert/server.csr`)
  },
  file_format: 'ep',
  anonymous: 'sillyrabbit'
});
server.on('login', ({username, password}, resolve, reject) => {
  if (username === 'test' && password === 'test' || username === 'anonymous') {
    resolve({root: require('os').homedir()});
  } else reject('Bad username or password');
});
server.listen();
