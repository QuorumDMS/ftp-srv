const net = require('net');
const tls = require('tls');
const ip = require('ip');
const Promise = require('bluebird');

const Connector = require('./base');
const errors = require('../errors');

class Passive extends Connector {
  constructor(connection) {
    super(connection);
    this.type = 'passive';
  }

  waitForConnection({timeout = 5000, delay = 250} = {}) {
    if (!this.dataServer) return Promise.reject(new errors.ConnectorError('Passive server not setup'));

    const checkSocket = () => {
      if (this.dataServer && this.dataServer.listening && this.dataSocket && this.dataSocket.connected) {
        return Promise.resolve(this.dataSocket);
      }
      return Promise.resolve().delay(delay)
      .then(() => checkSocket());
    };

    return checkSocket().timeout(timeout);
  }

  setupServer() {
    const closeExistingServer = () => this.dataServer ?
      new Promise(resolve => this.dataServer.close(() => resolve())) :
      Promise.resolve();

    return closeExistingServer()
    .then(() => this.server.getNextPasvPort())
    .then(port => {
      const connectionHandler = socket => {
        if (!ip.isEqual(this.connection.commandSocket.remoteAddress, socket.remoteAddress)) {
          this.log.error({
            pasv_connection: socket.remoteAddress,
            cmd_connection: this.connection.commandSocket.remoteAddress
          }, 'Connecting addresses do not match');

          socket.destroy();
          return this.connection.reply(550, 'Remote addresses do not match')
          .finally(() => this.connection.close());
        }
        this.log.trace({port, remoteAddress: socket.remoteAddress}, 'Passive connection fulfilled.');

        this.dataSocket = socket;
        this.dataSocket.connected = true;
        this.dataSocket.setEncoding(this.connection.transferType);
        this.dataSocket.on('error', err => this.server && this.server.emit('client-error', {connection: this.connection, context: 'dataSocket', error: err}));
        this.dataSocket.on('close', () => {
          this.log.trace('Passive connection closed');
          this.end();
        });
      };

      this.dataSocket = null;

      const serverOptions = Object.assign({}, this.connection.secure ? this.server.options.tls : {}, {pauseOnConnect: true});
      this.dataServer = (this.connection.secure ? tls : net).createServer(serverOptions, connectionHandler);
      this.dataServer.maxConnections = 1;

      this.dataServer.on('error', err => this.server && this.server.emit('client-error', {connection: this.connection, context: 'dataServer', error: err}));
      this.dataServer.on('close', () => {
        this.log.trace('Passive server closed');
        this.dataServer = null;
      });

      return new Promise((resolve, reject) => {
        this.dataServer.listen(port, this.server.url.hostname, err => {
          if (err) reject(err);
          else {
            this.log.debug({port}, 'Passive connection listening');
            resolve(this.dataServer);
          }
        });
      });
    });
  }

}
module.exports = Passive;
