/* eslint no-unused-expressions: 0 */
const {expect} = require('chai');
const sinon = require('sinon');

const net = require('net');

const ActiveConnector = require('../../src/connector/active');
const findPort = require('../../src/helpers/find-port');

describe('Connector - Active //', function () {
  let PORT;
  let active;
  let mockConnection = {};
  let sandbox;
  let server;

  before(() => {
    active = new ActiveConnector(mockConnection);
  });
  beforeEach(done => {
    sandbox = sinon.sandbox.create();

    findPort()
    .then(port => {
      PORT = port;
      server = net.createServer()
      .on('connection', socket => socket.destroy())
      .listen(PORT, () => done());
    });
  });
  afterEach(done => {
    sandbox.restore();
    server.close(done);
  });

  it('sets up a connection', function (done) {
    active.setupConnection('127.0.0.1', PORT)
    .then(() => {
      expect(active.dataSocket).to.exist;
      done();
    })
    .catch(done);
  });

  it('destroys existing connection, then sets up a connection', function (done) {
    const destroyFnSpy = sandbox.spy(active.dataSocket, 'destroy');

    active.setupConnection('127.0.0.1', PORT)
    .then(() => {
      expect(destroyFnSpy.callCount).to.equal(1);
      expect(active.dataSocket).to.exist;
      done();
    })
    .catch(done);
  });

  it('waits for connection', function (done) {
    active.setupConnection('127.0.0.1', PORT)
    .then(() => {
      expect(active.dataSocket).to.exist;
      return active.waitForConnection();
    })
    .then(() => done())
    .catch(done);
  });
});
