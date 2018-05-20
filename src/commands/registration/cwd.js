const Promise = require('bluebird');
const escapePath = require('../../helpers/escape-path');

module.exports = {
  directive: ['CWD', 'XCWD'],
  handler: function (connection, command) {
    if (!connection.fs) return connection.reply(550, 'File system not instantiated');
    if (!connection.fs.chdir) return connection.reply(402, 'Not supported by file system');

    return Promise.resolve(connection.fs.chdir(command.arg))
    .then(cwd => {
      const path = cwd ? `"${escapePath(cwd)}"` : undefined;
      return connection.reply(250, path);
    })
    .catch(err => {
      connection.emit('error', err);
      return connection.reply(550, err.message);
    });
  },
  syntax: '{{cmd}} <path>',
  description: 'Change working directory'
};
