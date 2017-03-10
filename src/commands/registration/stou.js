const stor = require('./stor').handler;

module.exports = {
  directive: 'STOU',
  handler: function (args) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.get || !this.fs.getUniqueName) return this.reply(402, 'Not supported by file system');

    const fileName = args.command._[1];
    return this.fs.get(fileName)
    .catch(() => fileName)                // does not exist, name is unique
    .then(() => this.fs.getUniqueName())  // exists, must create new unique name
    .then(name => {
      args.command._[1] = name;
      return stor.call(this, args);
    });
  },
  syntax: '{{cmd}}',
  description: 'Store file uniquely'
};
