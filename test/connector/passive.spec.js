/* eslint no-unused-expressions: 0 */
const {expect} = require('chai');
const sinon = require('sinon');

const when = require('when');
const net = require('net');
const bunyan = require('bunyan');

const PassiveConnector = require('../../src/connector/passive');

describe('Connector - Passive //', function () {
  let passive;
  let mockConnection = {
    reply: () => when.resolve({}),
    close: () => when.resolve({}),
    encoding: 'utf8',
    log: bunyan.createLogger({name: 'passive-test'}),
    commandSocket: {},
    server: { options: {} }
  };
  let sandbox;

  before(() => {
    passive = new PassiveConnector(mockConnection);
  });
  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.spy(mockConnection, 'reply');

    mockConnection.commandSocket.remoteAddress = '::ffff:127.0.0.1';
    mockConnection.server.options.pasv_range = '8000';
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('cannot wait for connection with no server', function (done) {
    passive.waitForConnection()
    .then(() => done('should not happen'))
    .catch(err => {
      expect(err.name).to.equal('ConnectorError');
      done();
    });
  });

  it('has invalid pasv range', function (done) {
    mockConnection.server.options.pasv_range = -1;

    passive.setupServer()
    .then(() => done('should not happen'))
    .catch(err => {
      expect(err.name).to.equal('RangeError');
      done();
    });
  });

  it('sets up a server', function (done) {
    passive.setupServer()
    .then(() => {
      expect(passive.dataServer).to.exist;
      done();
    })
    .catch(done);
  });

  it('destroys existing server, then sets up a server', function (done) {
    const closeFnSpy = sandbox.spy(passive.dataServer, 'close');

    passive.setupServer()
    .then(() => {
      expect(closeFnSpy.callCount).to.equal(1);
      expect(passive.dataServer).to.exist;
      done();
    })
    .catch(done);
  });

  it('refuses connection with different remote address', function (done) {
    mockConnection.commandSocket.remoteAddress = 'bad';

    passive.setupServer()
    .then(() => {
      expect(passive.dataServer).to.exist;

      const {port} = passive.dataServer.address();
      net.createConnection(port);
      passive.dataServer.once('connection', () => {
        expect(mockConnection.reply.callCount).to.equal(1);
        expect(mockConnection.reply.args[0][0]).to.equal(550);
        done();
      });
    })
    .catch(done);
  });

  it('accepts connection', function (done) {
    passive.setupServer()
    .then(() => {
      expect(passive.dataServer).to.exist;

      const {port} = passive.dataServer.address();
      net.createConnection(port);
      return passive.waitForConnection();
    })
    .then(() => {
      expect(passive.dataSocket).to.exist;
      passive.end();
      done();
    })
    .catch(done);
  });
});
