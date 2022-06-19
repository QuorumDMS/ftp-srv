const _ = require('lodash');
const Promise = require('bluebird');
const getFileStat = require('../../helpers/file-stat');

// http://cr.yp.to/ftp/list.html
// http://cr.yp.to/ftp/list/eplf.html
module.exports = {
  directive: 'LIST',
  handler: function ({log, command} = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.get) return this.reply(402, 'Not supported by file system');
    if (!this.fs.list) return this.reply(402, 'Not supported by file system');

    const simple = command.directive === 'NLST';

    const path = command.arg || '.';
    return this.connector.waitForConnection()
    .tap(() => this.commandSocket.pause())
    .then(() => Promise.try(() => this.fs.get(path)))
    .then((stat) => stat.isDirectory() ? Promise.try(() => this.fs.list(path)) : [stat])
    .then((files) => {
      const getFileMessage = (file) => {
        if (simple) return file.name;
        return getFileStat(file, _.get(this, 'server.options.file_format', 'ls'));
      };

      return Promise.try(() => files.map((file) => {
        const message = getFileMessage(file);
        return {
          raw: true,
          message,
          socket: this.connector.socket
        };
      }));
    })
    .tap(() => this.reply(150))
    .then((fileList) => {
      if (fileList.length) return this.reply({}, ...fileList);
      return this.reply({socket: this.connector.socket, useEmptyMessage: true});
    })
    .tap(() => this.reply(226))
    .catch(Promise.TimeoutError, (err) => {
      log.error(err);
      return this.reply(425, 'No connection established');
    })
    .catch((err) => {
      log.error(err);
      return this.reply(451, err.message || 'No directory');
    })
    .then(() => {
      this.connector.end();
      this.commandSocket.resume();
    });
  },
  syntax: '{{cmd}} [<path>]',
  description: 'Returns information of a file or directory if specified, else information of the current working directory is returned'
};
