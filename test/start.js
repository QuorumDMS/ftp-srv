require('dotenv').load();
const bunyan = require('bunyan');

const FtpServer = require('../src');

const log = bunyan.createLogger({name: 'test'});
log.level('info');
const server = new FtpServer('ftp://127.0.0.1:8880', {
  log,
  pasv_range: 8881
});
server.on('login', ({username, password}, resolve, reject) => {
  console.log(username, password);
  if (username === 'test' && password === 'test') resolve({ root: require('os').homedir() });
  else reject('Bad username or password');
});
server.listen();
