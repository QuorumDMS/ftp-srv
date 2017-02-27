require('dotenv').load();
const bunyan = require('bunyan');

const FtpServer = require('../src');

const log = bunyan.createLogger({name: 'test', level: 10});
const server = new FtpServer(process.env.FTP_URL, {
  log,
  pasv_range: process.env.PASV_RANGE
});
server.on('login', ({username, password}, resolve, reject) => {
  if (username === 'test' && password === 'test') resolve();
  else reject('Bad username or password');
});
server.listen();
