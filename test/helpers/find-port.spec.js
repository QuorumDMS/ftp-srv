/* eslint no-unused-expressions: 0 */
const {expect} = require('chai');
const net = require('net');

const {getNextPortFactory, portNumberGenerator} = require('../../src/helpers/find-port');

describe('getNextPortFactory', function () {
  describe('portNumberGenerator', () => {
    it('loops through given set of numbers', () => {
      const nextNumber = portNumberGenerator(1, 5);
      expect(nextNumber.next().value).to.equal(1);
      expect(nextNumber.next().value).to.equal(2);
      expect(nextNumber.next().value).to.equal(3);
      expect(nextNumber.next().value).to.equal(4);
      expect(nextNumber.next().value).to.equal(5);
      expect(nextNumber.next().value).to.equal(1);
      expect(nextNumber.next().value).to.equal(2);
    });
  });

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

  it('finds ports concurrently', () => {
    const portStart = 10000;
    const getCount = 100;

    const getNextPort = getNextPortFactory('::', portStart);
    const portFinders = new Array(getCount).fill().map(() => getNextPort());
    return Promise.all(portFinders)
    .then((ports) => {
      expect(ports.length).to.equal(getCount);
      expect(ports).to.eql(new Array(getCount).fill().map((v, i) => i + portStart));
    });
  });
});
