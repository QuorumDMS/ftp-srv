const when = require('when');
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
    return when.reject(new errors.ConnectorError('No connector setup, send PASV or PORT'));
  }

  end() {
    if (this.dataSocket) this.dataSocket.end();
    if (this.dataServer) this.dataServer.close();
    this.dataSocket = null;
    this.dataServer = null;
    this.type = false;
  }
}
module.exports = Connector;
