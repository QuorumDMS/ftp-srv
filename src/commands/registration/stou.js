const Promise = require('bluebird');
const {handler: stor} = require('./stor');

module.exports = {
  directive: 'STOU',
  handler: function (args) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.get || !this.fs.getUniqueName) return this.reply(402, 'Not supported by file system');

    const fileName = args.command.arg;
    return Promise.try(() => {
      return Promise.resolve(this.fs.get(fileName))
      .then(() => Promise.resolve(this.fs.getUniqueName()))
      .catch(() => Promise.resolve(fileName));
    })
    .then(name => {
      args.command.arg = name;
      return stor.call(this, args);
    });
  },
  syntax: '{{cmd}}',
  description: 'Store file uniquely'
};
