const _ = require('lodash');
const Promise = require('bluebird');
const getFileStat = require('../../helpers/file-stat');

// http://cr.yp.to/ftp/list.html
// http://cr.yp.to/ftp/list/eplf.html
module.exports = {
  directive: 'LIST',
  handler: function (connection, command) {
    if (!connection.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.get) return this.reply(402, 'Not supported by file system');
    if (!this.fs.list) return this.reply(402, 'Not supported by file system');

    const simple = command.directive === 'NLST';

    const path = command.arg || '.';
    return connection.connector.waitForConnection()
    .tap(() => connection.commandSocket.pause())
    .then(() => Promise.resolve(connection.fs.get(path)))
    .then(stat => stat.isDirectory() ? Promise.resolve(connection.fs.list(path)) : [stat])
    .then(files => {
      const getFileMessage = file => {
        if (simple) return file.name;
        return getFileStat(file, _.get(connection, 'server.options.file_format', 'ls'));
      };

      const fileList = files.map(file => {
        const message = getFileMessage(file);
        return {
          raw: true,
          message,
          socket: connection.connector.socket
        };
      });
      return connection.reply(150)
      .then(() => {
        if (fileList.length) return connection.reply({}, ...fileList);
      });
    })
    .then(() => connection.reply(226))
    .catch(Promise.TimeoutError, err => {
      connection.emit('error', err);
      return connection.reply(425, 'No connection established');
    })
    .catch(err => {
      connection.emit('error', err);
      return connection.reply(451, err.message || 'No directory');
    })
    .finally(() => {
      connection.connector.end();
      connection.commandSocket.resume();
    });
  },
  syntax: '{{cmd}} [<path>]',
  description: 'Returns information of a file or directory if specified, else information of the current working directory is returned'
};
