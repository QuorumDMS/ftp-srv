const _ = require('lodash');
const when = require('when');
const getFileStat = require('../../helpers/file-stat');

module.exports = {
  directive: 'STAT',
  handler: function (args = {}) {
    const {log, command} = args;
    const path = _.get(command, '_[1]');
    if (path) {
      if (!this.fs) return this.reply(550, 'File system not instantiated');
      if (!this.fs.get) return this.reply(402, 'Not supported by file system');

      return when.try(this.fs.get.bind(this.fs), path)
      .then(stat => {
        if (stat.isDirectory()) {
          if (!this.fs.list) return this.reply(402, 'Not supported by file system');

          return when.try(this.fs.list.bind(this.fs), path)
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
          return this.reply(212, getFileStat(stat, _.get(this, 'server.options.file_format', 'ls')));
        }
      })
      .catch(err => {
        log.error(err);
        return this.reply(450);
      });
    } else {
      return this.reply(211, 'Status OK');
    }
  },
  syntax: '{{cmd}} [path(optional)]',
  description: 'Returns the current status'
};
