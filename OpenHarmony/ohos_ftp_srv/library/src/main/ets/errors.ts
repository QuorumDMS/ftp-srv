export class GeneralError extends Error {
  private code;

  constructor(message, code = 400) {
    super();
    this.code = code;
    this.name = 'GeneralError';
    this.message = message;
  }
}

export class SocketError extends Error {
  private code;

  constructor(message, code = 500) {
    super();
    this.code = code;
    this.name = 'SocketError';
    this.message = message;
  }
}

export class FileSystemError extends Error {
  private code;

  constructor(message, code = 400) {
    super();
    this.code = code;
    this.name = 'FileSystemError';
    this.message = message;
  }
}

export class ConnectorError extends Error {
  private code;

  constructor(message, code = 400) {
    super();
    this.code = code;
    this.name = 'ConnectorError';
    this.message = message;
  }
}


