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

  closeSocket() {
    return new Promise((resolve) => {
      if (this.dataSocket) {
        this.dataSocket.end().destroy();
        this.dataSocket = null;
      }
      resolve();
    });
  }

  closeServer() {
    return new Promise((resolve) => {
      if (this.dataServer) {
        this.dataServer.close(() => resolve());
        this.dataServer = null;
      } else resolve();
    });
  }


  end() {
    return Promise.all([this.closeSocket(), this.closeServer()])
    .then(() => {
      this.type = false;

      this.connection.connector = new Connector(this);
    });
  }
}
module.exports = Connector;
