/* eslint no-unused-expressions: 0 */
const {expect} = require('chai');
const net = require('net');

const {getNextPortFactory} = require('../../src/helpers/find-port');

describe('helpers // find-port', function () {
  describe('keeps trying new ports', () => {
    let getNextPort;
    let serverAlreadyRunning;
    beforeEach((done) => {
      const host = '0.0.0.0';
      getNextPort = getNextPortFactory(host, 8821);

      serverAlreadyRunning = net.createServer();
      serverAlreadyRunning.listen(8821, host, () => done());
    });

    afterEach((done) => {
      serverAlreadyRunning.close(() => done());
    });

    it('test', async () => {
      const port = await getNextPort();
      expect(port).to.equal(8822);
    })
  });
});
