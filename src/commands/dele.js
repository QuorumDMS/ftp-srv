const when = require('when');

module.exports = function ({log, command} = {}) {
  if (!this.fs) return this.reply(550, 'File system not instantiated');
  if (!this.fs.delete) return this.reply(402, 'Not supported by file system');

  return when(this.fs.delete(command._[1]))
  .then(() => {
    return this.reply(250);
  })
  .catch(err => {
    log.error(err);
    return this.reply(550);
  });
}
