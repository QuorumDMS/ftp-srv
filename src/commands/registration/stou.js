const Promise = require('bluebird');
const {handler: stor} = require('./stor');

module.exports = {
  directive: 'STOU',
  handler: function (args) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.get || !this.fs.getUniqueName) return this.reply(402, 'Not supported by file system');

    const fileName = args.command.arg;
    return Promise.try(() => this.fs.get(fileName))
    .then(() => Promise.try(() => this.fs.getUniqueName(fileName)))
    .catch(() => fileName)
    .then((name) => {
      args.command.arg = name;
      return stor.call(this, args);
    });
  },
  syntax: '{{cmd}}',
  description: 'Store file uniquely'
};
