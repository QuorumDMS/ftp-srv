import {ConnectorError} from "../errors";

export class Connector {

  connection;
  dataSocket;
  dataServer;
  type;

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
    return Promise.reject(new ConnectorError('No connector setup, send PASV or PORT'));
  }

  closeSocket() {
    if (this.dataSocket) {
      const socket = this.dataSocket;
      socket.close((err)=>{
        if(err){
          return;
        }
      })
      this.dataSocket =null;
    }
  }

  closeServer() {
    if (this.dataServer) {

      this.dataServer = null;
    }
  }


  end() {
    this.closeSocket();
    this.closeServer();

    this.type = false;
    this.connection.connector = new Connector(this);
  }
}

