const Promise = require('bluebird');
const escapePath = require('../../helpers/escape-path');

module.exports = {
  directive: ['CWD', 'XCWD'],
  handler: function ({log, command} = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.chdir) return this.reply(402, 'Not supported by file system');

    return Promise.try(() => this.fs.chdir(command.arg))
    .then((cwd) => {
      const path = cwd ? `"${escapePath(cwd)}"` : undefined;
      return this.reply(250, path);
    })
    .catch((err) => {
      log.error(err);
      return this.reply(550, err.message);
    });
  },
  syntax: '{{cmd}} <path>',
  description: 'Change working directory'
};
