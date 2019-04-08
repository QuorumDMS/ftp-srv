const Promise = require('bluebird');
const escapePath = require('../../helpers/escape-path');

module.exports = {
  directive: ['PWD', 'XPWD'],
  handler: function ({log} = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.currentDirectory) return this.reply(402, 'Not supported by file system');

    return Promise.try(() => this.fs.currentDirectory())
    .then((cwd) => {
      const path = cwd ? `"${escapePath(cwd)}"` : undefined;
      return this.reply(257, path);
    })
    .catch((err) => {
      log.error(err);
      return this.reply(550, err.message);
    });
  },
  syntax: '{{cmd}}',
  description: 'Print current working directory'
};
