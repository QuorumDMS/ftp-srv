
class GeneralError extends Error {
  constructor(message, code = 400) {
    super();
    this.code = code;
    this.name = 'GeneralError';
    this.message = message;
  }
}

class SocketError extends Error {
  constructor(message, code = 500) {
    super();
    this.code = code;
    this.name = 'SocketError';
    this.message = message;
  }
}

class FileSystemError extends Error {
  constructor(message, code = 400) {
    super();
    this.code = code;
    this.name = 'FileSystemError';
    this.message = message;
  }
}

class ConnectorError extends Error {
  constructor(message, code = 400) {
    super();
    this.code = code;
    this.name = 'ConnectorError';
    this.message = message;
  }
}


module.exports = {
  SocketError,
  FileSystemError,
  ConnectorError,
  GeneralError
};
