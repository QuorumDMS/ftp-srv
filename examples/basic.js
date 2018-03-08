const FtpSrv = require('../src');

const server = new FtpSrv();
server.listen(8880)
.then(() => {
  console.log('listening');
});
