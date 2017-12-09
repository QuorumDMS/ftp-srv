const _ = require('lodash');
const Promise = require('bluebird');
const getFileStat = require('../../helpers/file-stat');

module.exports = {
  directive: 'STAT',
  handler: function (args = {}) {
    const {log, command} = args;
    const path = _.get(command, 'arg');
    if (path) {
      if (!this.fs) return this.reply(550, 'File system not instantiated');
      if (!this.fs.get) return this.reply(402, 'Not supported by file system');

      return Promise.try(() => this.fs.get(path))
      .then(stat => {
        if (stat.isDirectory()) {
          if (!this.fs.list) return this.reply(402, 'Not supported by file system');

          return Promise.try(() => this.fs.list(path))
          .then(files => {
            const fileList = files.map(file => {
              const message = getFileStat(file, _.get(this, 'server.options.file_format', 'ls'));
              return {
                raw: true,
                message
              };
            });
            return this.reply(213, 'Status begin', ...fileList, 'Status end');
          });
        } else {
          const message = getFileStat(stat, _.get(this, 'server.options.file_format', 'ls'));
          return this.reply(212, 'Status begin', {raw: true, message}, 'Status end');
        }
      })
      .catch(err => {
        log.error(err);
        return this.reply(450, err.message);
      });
    } else {
      return this.reply(211, 'Status OK');
    }
  },
  syntax: '{{cmd}} [<path>]',
  description: 'Returns the current status'
};
