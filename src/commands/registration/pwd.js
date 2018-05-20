const Promise = require('bluebird');
const escapePath = require('../../helpers/escape-path');

module.exports = {
  directive: ['PWD', 'XPWD'],
  handler: function (connection) {
    if (!connection.fs) return connection.reply(550, 'File system not instantiated');
    if (!connection.fs.currentDirectory) return connection.reply(402, 'Not supported by file system');

    return Promise.resolve(connection.fs.currentDirectory())
    .then(cwd => {
      const path = cwd ? `"${escapePath(cwd)}"` : undefined;
      return connection.reply(257, path);
    })
    .catch(err => {
      connection.emit('error', err);
      return connection.reply(550, err.message);
    });
  },
  syntax: '{{cmd}}',
  description: 'Print current working directory'
};
