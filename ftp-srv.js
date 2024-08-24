const FtpServer = require('./src');
const FtpConnection = require('./src/connection');
const FileSystem = require('./src/fs');
const errors = require('./src/errors');

module.exports = FtpServer;
module.exports.FtpSrv = FtpServer;
module.exports.FtpServer = FtpServer;
module.exports.FileSystem = FileSystem;
module.exports.GeneralError = errors.GeneralError;
module.exports.SocketError = errors.SocketError;
module.exports.FileSystemError = errors.FileSystemError;
module.exports.ConnectorError = errors.ConnectorError;
module.exports.FtpConnection = FtpConnection;
