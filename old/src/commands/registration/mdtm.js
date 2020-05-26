const Promise = require('bluebird');
const moment = require('moment');

module.exports = {
  directive: 'MDTM',
  handler: function ({log, command} = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.get) return this.reply(402, 'Not supported by file system');

    return Promise.try(() => this.fs.get(command.arg))
    .then((fileStat) => {
      const modificationTime = moment.utc(fileStat.mtime).format('YYYYMMDDHHmmss.SSS');
      return this.reply(213, modificationTime);
    })
    .catch((err) => {
      log.error(err);
      return this.reply(550, err.message);
    });
  },
  syntax: '{{cmd}} <path>',
  description: 'Return the last-modified time of a specified file',
  flags: {
    feat: 'MDTM'
  }
};
