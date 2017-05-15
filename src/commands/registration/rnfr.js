const when = require('when');

module.exports = {
  directive: 'RNFR',
  handler: function ({log, command} = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.get) return this.reply(402, 'Not supported by file system');

    const fileName = command.arg;
    return when.try(this.fs.get.bind(this.fs), fileName)
    .then(() => {
      this.renameFrom = fileName;
      return this.reply(350);
    })
    .catch(err => {
      log.error(err);
      return this.reply(550, err.message);
    });
  },
  syntax: '{{cmd}} <name>',
  description: 'Rename from'
};
