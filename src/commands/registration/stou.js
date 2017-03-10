const stor = require('./stor').handler;

module.exports = {
  directive: 'STOU',
  handler: function (args) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.getUniqueName) return this.reply(402, 'Not supported by file system');

    args.command._[1] = this.fs.getUniqueName();
    return stor.call(this, args);
  },
  syntax: '{{cmd}}',
  description: 'Store file uniquely'
};
