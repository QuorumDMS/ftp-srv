const Promise = require('bluebird');

module.exports = {
  directive: 'RNTO',
  handler: function (connection, command) {
    if (!connection.renameFrom) return connection.reply(503);

    if (!connection.fs) return connection.reply(550, 'File system not instantiated');
    if (!connection.fs.rename) return connection.reply(402, 'Not supported by file system');

    const from = connection.renameFrom;
    const to = command.arg;

    return Promise.resolve(connection.fs.rename(from, to))
    .then(() => {
      return connection.reply(250);
    })
    .catch(err => {
      connection.emit('error', err);
      return connection.reply(550, err.message);
    })
    .finally(() => {
      delete connection.renameFrom;
    });
  },
  syntax: '{{cmd}} <name>',
  description: 'Rename to'
};
