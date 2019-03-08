/* eslint no-unused-expressions: 0 */
const {expect} = require('chai');
const net = require('net');

const {getNextPortFactory} = require('../../src/helpers/find-port');

describe('helpers // find-port', function () {
  describe('keeps trying new ports', () => {
    let getNextPort;
    let serverAlreadyRunning;
    beforeEach((done) => {
      getNextPort = getNextPortFactory('::', 8821);

      serverAlreadyRunning = net.createServer();
      serverAlreadyRunning.listen(8821, () => done());
    });

    afterEach((done) => {
      serverAlreadyRunning.close(() => done());
    });

    it('test', () => {
      return getNextPort()
      .then((port) => {
        expect(port).to.equal(8822);
      });
    });
  });
});
