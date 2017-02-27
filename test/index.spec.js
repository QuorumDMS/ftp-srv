const FtpServer = require('../lib');

describe('FtpServer', () => {
  let server;
  it('server listens for connections', done => {
    server = new FtpServer({
      url: process.env.FTP_URL
    });
  })
});
