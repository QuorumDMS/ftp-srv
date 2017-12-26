const Promise = require('bluebird');
const errors = require('../errors');

class Connector {
  constructor(connection) {
    this.connection = connection;

    this.dataSocket = null;
    this.dataServer = null;
    this.type = false;
  }

  get log() {
    return this.connection.log;
  }

  get socket() {
    return this.dataSocket;
  }

  get server() {
    return this.connection.server;
  }

  waitForConnection() {
    return Promise.reject(new errors.ConnectorError('No connector setup, send PASV or PORT'));
  }

  end() {
    const closeDataSocket = new Promise(resolve => {
      if (this.dataSocket) this.dataSocket.end();
      else resolve();
    });
    const closeDataServer = new Promise(resolve => {
      if (this.dataServer) this.dataServer.close(() => resolve());
      else resolve();
    });

    return Promise.all([closeDataSocket, closeDataServer])
    .then(() => {
      this.dataSocket = null;
      this.dataServer = null;
      this.type = false;
    });
  }
}
module.exports = Connector;
