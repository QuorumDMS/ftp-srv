const Promise = require('bluebird');

module.exports = {
  directive: 'SIZE',
  handler: function (connection, command) {
    if (!connection.fs) return connection.reply(550, 'File system not instantiated');
    if (!connection.fs.get) return connection.reply(402, 'Not supported by file system');

    return Promise.resolve(connection.fs.get(command.arg))
    .then(fileStat => {
      return connection.reply(213, {message: fileStat.size});
    })
    .catch(err => {
      connection.emit('error', err);
      return connection.reply(550, err.message);
    });
  },
  syntax: '{{cmd}} <path>',
  description: 'Return the size of a file',
  flags: {
    feat: 'SIZE'
  }
};
