const _ = require('lodash');
const Promise = require('bluebird');
const getFileStat = require('../../helpers/file-stat');

module.exports = {
  directive: 'STAT',
  handler: function (connection, command) {
    const path = _.get(command, 'arg');
    if (path) {
      if (!connection.fs) return connection.reply(550, 'File system not instantiated');
      if (!connection.fs.get) return connection.reply(402, 'Not supported by file system');

      return Promise.resolve(connection.fs.get(path))
      .then(stat => {
        if (stat.isDirectory()) {
          if (!connection.fs.list) return connection.reply(402, 'Not supported by file system');

          return Promise.resolve(connection.fs.list(path))
          .then(stats => [213, stats]);
        }
        return [212, [stat]];
      })
      .then(([code, fileStats]) => {
        return Promise.map(fileStats, file => {
          const message = getFileStat(file, _.get(connection, 'server.options.file_format', 'ls'));
          return {
            raw: true,
            message
          };
        })
        .then(messages => [code, messages]);
      })
      .then(([code, messages]) => connection.reply(code, 'Status begin', ...messages, 'Status end'))
      .catch(err => {
        connection.emit('error', err);
        return connection.reply(450, err.message);
      });
    } else {
      return connection.reply(211, 'Status OK');
    }
  },
  syntax: '{{cmd}} [<path>]',
  description: 'Returns the current status'
};
