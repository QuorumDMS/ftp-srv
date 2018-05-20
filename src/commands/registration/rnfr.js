const Promise = require('bluebird');

module.exports = {
  directive: 'RNFR',
  handler: function (connection, command) {
    if (!connection.fs) return connection.reply(550, 'File system not instantiated');
    if (!connection.fs.get) return connection.reply(402, 'Not supported by file system');

    const fileName = command.arg;
    return Promise.resolve(connection.fs.get(fileName))
    .then(() => {
      connection.renameFrom = fileName;
      return connection.reply(350);
    })
    .catch(err => {
      connection.emit('error', err);
      return connection.reply(550, err.message);
    });
  },
  syntax: '{{cmd}} <name>',
  description: 'Rename from'
};
