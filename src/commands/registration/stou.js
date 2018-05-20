const Promise = require('bluebird');
const {handler: stor} = require('./stor');

module.exports = {
  directive: 'STOU',
  handler: function (connection, command, ...args) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.get || !this.fs.getUniqueName) return this.reply(402, 'Not supported by file system');

    const fileName = command.arg;
    return Promise.try(() => {
      return Promise.resolve(this.fs.get(fileName))
      .then(() => Promise.resolve(this.fs.getUniqueName()))
      .catch(() => Promise.resolve(fileName));
    })
    .then(name => {
      command.arg = name;
      return stor.call(this, connection, command, ...args);
    });
  },
  syntax: '{{cmd}}',
  description: 'Store file uniquely'
};
