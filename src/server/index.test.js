
const Server = require('./');

describe('Server', function () {
  let server;

  beforeAll(function () {
    server = new Server({
      port: 8880
    });
  });

  afterAll(async function () {
    const value = await server.close();
    console.log(value)
  });

  describe('.listen', function () {
    it('# listens', async function () {
      await server.listen();
    });
  });
});
