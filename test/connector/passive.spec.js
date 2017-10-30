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
    server: {options: {}}
  };
  let sandbox;

  function shouldNotResolve() {
    throw new Error('Should not resolve');
  }

  before(() => {
    passive = new PassiveConnector(mockConnection);
  });
  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.spy(mockConnection, 'reply');
    sandbox.spy(mockConnection, 'close');

    mockConnection.commandSocket.remoteAddress = '::ffff:127.0.0.1';
    mockConnection.server.options.pasv_range = '8000';
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('cannot wait for connection with no server', function () {
    return passive.waitForConnection()
    .then(shouldNotResolve)
    .catch(err => {
      expect(err.name).to.equal('ConnectorError');
    });
  });

  it('no pasv range provided', function () {
    delete mockConnection.server.options.pasv_range;

    return passive.setupServer()
    .then(shouldNotResolve)
    .catch(err => {
      expect(err.name).to.equal('ConnectorError');
    });
  });

  it('has invalid pasv range', function () {
    mockConnection.server.options.pasv_range = -1;

    return passive.setupServer()
    .then(shouldNotResolve)
    .catch(err => {
      expect(err.name).to.equal('RangeError');
    });
  });

  it('sets up a server', function () {
    return passive.setupServer()
    .then(() => {
      expect(passive.dataServer).to.exist;
    });
  });

  it('destroys existing server, then sets up a server', function () {
    const closeFnSpy = sandbox.spy(passive.dataServer, 'close');

    return passive.setupServer()
    .then(() => {
      expect(closeFnSpy.callCount).to.equal(1);
      expect(passive.dataServer).to.exist;
    });
  });

  it('refuses connection with different remote address', function (done) {
    mockConnection.commandSocket.remoteAddress = 'bad';

    passive.setupServer()
    .then(() => {
      expect(passive.dataServer).to.exist;

      const {port} = passive.dataServer.address();
      net.createConnection(port);
      passive.dataServer.once('connection', () => {
        setTimeout(() => {
          expect(passive.connection.reply.callCount).to.equal(1);
          expect(passive.connection.reply.args[0][0]).to.equal(550);
          done();
        }, 100);
      });
    })
    .catch(done);
  });

  it('accepts connection', function () {
    return passive.setupServer()
    .then(() => {
      expect(passive.dataServer).to.exist;

      const {port} = passive.dataServer.address();
      net.createConnection(port);
      return passive.waitForConnection();
    })
    .then(() => {
      expect(passive.dataSocket).to.exist;
      passive.end();
    });
  });
});
