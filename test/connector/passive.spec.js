/* eslint no-unused-expressions: 0 */
const {expect} = require('chai');
const sinon = require('sinon');

const Promise = require('bluebird');
const net = require('net');
const bunyan = require('bunyan');

const PassiveConnector = require('../../src/connector/passive');
const {getNextPortFactory} = require('../../src/helpers/find-port');

describe('Connector - Passive //', function () {
  const host = '127.0.0.1';
  let mockConnection = {
    reply: () => Promise.resolve({}),
    close: () => Promise.resolve({}),
    encoding: 'utf8',
    log: bunyan.createLogger({name: 'passive-test'}),
    commandSocket: {
      remoteAddress: '::ffff:127.0.0.1'
    },
    server: {
      url: '',
      getNextPasvPort: getNextPortFactory(host, 1024)
    }
  };
  let sandbox;

  before(() => {
    sandbox = sinon.sandbox.create().usingPromise(Promise);
  });

  beforeEach(() => {
    sandbox.spy(mockConnection, 'reply');
    sandbox.spy(mockConnection, 'close');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('cannot wait for connection with no server', function (done) {
    let passive = new PassiveConnector(mockConnection);
    passive.waitForConnection()
    .catch((err) => {
      expect(err.name).to.equal('ConnectorError');
      done();
    });
  });

  describe('setup', function () {
    before(function () {
      sandbox.stub(mockConnection.server, 'getNextPasvPort').value(getNextPortFactory(host));
    });

    it('no pasv range provided', function (done) {
      let passive = new PassiveConnector(mockConnection);
      passive.setupServer()
      .catch((err) => {
        try {
          expect(err.name).to.contain('RangeError');
          done();
        } catch (ex) {
          done(ex);
        }
      });
    });
  });

  describe('setup', function () {
    let connection;
    before(function () {
      sandbox.stub(mockConnection.server, 'getNextPasvPort').value(getNextPortFactory(host, -1, -1));

      connection = new PassiveConnector(mockConnection);
    });

    it('has invalid pasv range', function (done) {
      connection.setupServer()
      .catch((err) => {
        expect(err.name).to.contain('RangeError');
        done();
      });
    });
  });

  it('sets up a server', function () {
    let passive = new PassiveConnector(mockConnection);
    return passive.setupServer()
    .then(() => {
      expect(passive.dataServer).to.exist;
      return passive.end();
    });
  });

  describe('setup', function () {
    let passive;
    let closeFnSpy;
    beforeEach(function () {
      passive = new PassiveConnector(mockConnection);
      return passive.setupServer()
      .then(() => {
        closeFnSpy = sandbox.spy(passive.dataServer, 'close');
      });
    });
    afterEach(function () {
      return passive.end();
    });

    it('destroys existing server, then sets up a server', function () {
      return passive.setupServer()
      .then(() => {
        expect(closeFnSpy.callCount).to.equal(1);
        expect(passive.dataServer).to.exist;
      });
    });
  });

  it('refuses connection with different remote address', function (done) {
    sandbox.stub(mockConnection.commandSocket, 'remoteAddress').value('bad');

    let passive = new PassiveConnector(mockConnection);
    passive.setupServer()
    .then(() => {
      expect(passive.dataServer).to.exist;

      const {port} = passive.dataServer.address();
      net.createConnection(port);
      passive.dataServer.once('connection', () => {
        setTimeout(() => {
          expect(passive.connection.reply.callCount).to.equal(1);
          expect(passive.connection.reply.args[0][0]).to.equal(550);

          passive.end();
          done();
        }, 100);
      });
    })
    .catch(done);
  });

  it('accepts connection', function () {
    let passive = new PassiveConnector(mockConnection);
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
