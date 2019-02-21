/* eslint no-unused-expressions: 0 */
const {expect} = require('chai');
const net = require('net');
const sinon = require('sinon');

const {getNextPortFactory} = require('../../src/helpers/find-port');

describe('helpers // find-port', function () {
  let sandbox;
  let getNextPort;

  beforeEach(() => {
    sandbox = sinon.sandbox.create().usingPromise(Promise);

    getNextPort = getNextPortFactory(1, 2);
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('finds a port', () => {
    sandbox.stub(net.Server.prototype, 'listen').callsFake(function (port) {
      this.address = () => ({port});
      setImmediate(() => this.emit('listening'));
    });

    return getNextPort()
    .then((port) => {
      expect(port).to.equal(1);
    });
  });

  it('restarts count', () => {
    sandbox.stub(net.Server.prototype, 'listen').callsFake(function (port) {
      this.address = () => ({port});
      setImmediate(() => this.emit('listening'));
    });

    return getNextPort()
    .then((port) => {
      expect(port).to.equal(1);
    })
    .then(() => getNextPort())
    .then((port) => {
      expect(port).to.equal(2);
    })
    .then(() => getNextPort())
    .then((port) => {
      expect(port).to.equal(1);
    });
  });
});
