const when = require('when');

module.exports = {
  directive: 'SIZE',
  handler: function ({log, command} = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.get) return this.reply(402, 'Not supported by file system');

    return when.try(this.fs.get.bind(this.fs), command.arg)
    .then(fileStat => {
      return this.reply(213, {message: fileStat.size});
    })
    .catch(err => {
      log.error(err);
      return this.reply(550, err.message);
    });
  },
  syntax: '{{cmd}} <path>',
  description: 'Return the size of a file',
  flags: {
    feat: 'SIZE'
  }
};
