const Promise = require('bluebird');

module.exports = {
  directive: 'DELE',
  handler: function ({log, command} = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.delete) return this.reply(402, 'Not supported by file system');

    return Promise.try(() => this.fs.delete(command.arg))
    .then(() => {
      return this.reply(250);
    })
    .catch((err) => {
      log.error(err);
      return this.reply(550, err.message);
    });
  },
  syntax: '{{cmd}} <path>',
  description: 'Delete file'
};
