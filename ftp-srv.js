const FtpSrv = require('./src');
const FileSystem = require('./src/fs');
const errors = require('./src/errors');

module.exports = FtpSrv;
module.exports.FtpSrv = FtpSrv;
module.exports.FileSystem = FileSystem;
module.exports.ftpErrors = errors;
