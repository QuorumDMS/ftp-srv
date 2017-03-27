const _ = require('lodash');
const when = require('when');
const getFileStat = require('../../helpers/file-stat');

// http://cr.yp.to/ftp/list.html
// http://cr.yp.to/ftp/list/eplf.html
module.exports = {
  directive: 'LIST',
  handler: function ({log, command} = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.list) return this.reply(402, 'Not supported by file system');

    const simple = command.directive === 'NLST';

    let dataSocket;
    const directory = command._[1] || '.';
    return this.connector.waitForConnection()
    .then(socket => {
      this.commandSocket.pause();
      dataSocket = socket;
    })
    .then(() => when.try(this.fs.list.bind(this.fs), directory))
    .then(files => {
      const getFileMessage = file => {
        if (simple) return file.name;
        return getFileStat(file, _.get(this, 'server.options.file_format', 'ls'));
      };

      const fileList = files.map(file => {
        const message = getFileMessage(file);
        return {
          raw: true,
          message,
          socket: dataSocket
        };
      });
      return this.reply(150)
      .then(() => {
        if (fileList.length) return this.reply({}, ...fileList);
      });
    })
    .then(() => {
      return this.reply(226, 'Transfer OK');
    })
    .catch(when.TimeoutError, err => {
      log.error(err);
      return this.reply(425, 'No connection established');
    })
    .catch(err => {
      log.error(err);
      return this.reply(err.code || 451, err.message || 'No directory');
    })
    .finally(() => {
      this.connector.end();
      this.commandSocket.resume();
    });
  },
  syntax: '{{cmd}} [path(optional)]',
  description: 'Returns information of a file or directory if specified, else information of the current working directory is returned'
};
