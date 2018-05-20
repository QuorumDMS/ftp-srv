const Promise = require('bluebird');

module.exports = {
  directive: 'DELE',
  handler: function (connection, command) {
    if (!connection.fs) return connection.reply(550, 'File system not instantiated');
    if (!connection.fs.delete) return connection.reply(402, 'Not supported by file system');

    return Promise.resolve(connection.fs.delete(command.arg))
    .then(() => {
      return connection.reply(250);
    })
    .catch(err => {
      connection.emit('error', err);
      return connection.reply(550, err.message);
    });
  },
  syntax: '{{cmd}} <path>',
  description: 'Delete file'
};
