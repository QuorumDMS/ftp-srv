
class GeneralError extends Error {
  constructor(message, code = 400) {
    super(message);
    this.code = code;
    this.name = 'GeneralError';
  }
}

class SocketError extends Error {
  constructor(message, code = 500) {
    super(message);
    this.code = code;
    this.name = 'SocketError';
  }
}

class FileSystemError extends Error {
  constructor(message, code = 400) {
    super(message);
    this.code = code;
    this.name = 'FileSystemError';
  }
}

class ConnectorError extends Error {
  constructor(message, code = 400) {
    super(message);
    this.code = code;
    this.name = 'ConnectorError';
  }
}


module.exports = {
  SocketError,
  FileSystemError,
  ConnectorError,
  GeneralError
};
