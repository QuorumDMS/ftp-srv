const Promise = require('bluebird');
const moment = require('moment');

module.exports = {
  directive: 'MDTM',
  handler: function (connection, command) {
    if (!connection.fs) return connection.reply(550, 'File system not instantiated');
    if (!connection.fs.get) return connection.reply(402, 'Not supported by file system');

    return Promise.resolve(connection.fs.get(command.arg))
    .then(fileStat => {
      const modificationTime = moment.utc(fileStat.mtime).format('YYYYMMDDHHmmss.SSS');
      return connection.reply(213, modificationTime);
    })
    .catch(err => {
      connection.emit('error', err);
      return connection.reply(550, err.message);
    });
  },
  syntax: '{{cmd}} <path>',
  description: 'Return the last-modified time of a specified file',
  flags: {
    feat: 'MDTM'
  }
};
