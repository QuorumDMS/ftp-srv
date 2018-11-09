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
    const closeDataSocket = new Promise(resolve => {
      if (this.dataSocket) {
        this.dataSocket.end().destroy();
        this.dataSocket = null;
      }
      resolve();
    });

    return closeDataSocket;
  }
    
  closeServer() {
    const closeDataServer = new Promise(resolve => {
      if (this.dataServer) {
        this.dataServer.close();
        this.dataServer = null;
      }
      resolve();
    });

    return closeDataServer;
  }

      
  end() {
    const closeDataSocket = this.closeSocket();

    const closeDataServer = this.closeServer();

    return Promise.all([closeDataSocket, closeDataServer])
    .then(() => {
      this.type = false;

      this.connection.connector = new Connector(this);
    });
  }
}
module.exports = Connector;
