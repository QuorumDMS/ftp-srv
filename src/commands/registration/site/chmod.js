const when = require('when');

module.exports = function ({log, command} = {}) {
  if (!this.fs) return this.reply(550, 'File system not instantiated');
  if (!this.fs.chmod) return this.reply(402, 'Not supported by file system');

  const [, mode, fileName] = command._;
  return when.try(this.fs.chmod.bind(this.fs), fileName, parseInt(mode, 8))
  .then(() => {
    return this.reply(200);
  })
  .catch(err => {
    log.error(err);
    return this.reply(500);
  });
};
