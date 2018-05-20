const Promise = require('bluebird');
const escapePath = require('../../helpers/escape-path');

module.exports = {
  directive: ['MKD', 'XMKD'],
  handler: function (connection, command) {
    if (!connection.fs) return connection.reply(550, 'File system not instantiated');
    if (!connection.fs.mkdir) return connection.reply(402, 'Not supported by file system');

    return Promise.resolve(connection.fs.mkdir(command.arg))
    .then(dir => {
      const path = dir ? `"${escapePath(dir)}"` : undefined;
      return connection.reply(257, path);
    })
    .catch(err => {
      connection.emit('error', err);
      return connection.reply(550, err.message);
    });
  },
  syntax: '{{cmd}} <path>',
  description: 'Make directory'
};
