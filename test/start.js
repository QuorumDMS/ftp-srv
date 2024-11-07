const winston = require('winston');
const fs = require('fs');
const FtpServer = require('../src');

const server = new FtpServer({
  log: winston.createLogger({name: 'test', level: 'trace', transports: [new winston.transports.Console({
      level: 'silly',
    })]}),
  url: 'ftp://127.0.0.1:8880',
  pasv_url: '192.168.1.1',
  pasv_min: 8881,
  greeting: ['Welcome', 'to', 'the', 'jungle!'],
  tls: {
    key: fs.readFileSync(`${__dirname}/cert/server.key`),
    cert: fs.readFileSync(`${__dirname}/cert/server.crt`),
    ca: fs.readFileSync(`${__dirname}/cert/server.csr`)
  },
  file_format: 'ep',
  anonymous: 'sillyrabbit'
});
server.on('login', ({username, password}, resolve, reject) => {
  if (username === 'test' && password === 'test' || username === 'anonymous') {
    resolve({root: __dirname});
  } else reject('Bad username or password');
});
server.listen();
