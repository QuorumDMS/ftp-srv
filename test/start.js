require('dotenv').load();
const FtpServer = require('../src');

const server = new FtpServer('ftp://127.0.0.1:8880', {
  pasv_range: 8881,
  greeting: ['Welcome', 'to', 'the', 'jungle!'],
  tls: {
    key: `${process.cwd()}/test/cert/server.key`,
    cert: `${process.cwd()}/test/cert/server.crt`,
    ca: `${process.cwd()}/test/cert/server.csr`
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
