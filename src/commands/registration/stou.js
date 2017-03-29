const when = require('when');

const stor = require('./stor').handler;

module.exports = {
  directive: 'STOU',
  handler: function (args) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.get || !this.fs.getUniqueName) return this.reply(402, 'Not supported by file system');

    const fileName = args.command._[1];
    return when.try(() => {
      return when.try(this.fs.get.bind(this.fs), fileName)
      .then(() => when.try(this.fs.getUniqueName.bind(this.fs)))
      .catch(() => when.resolve(fileName));
    })
    .then(name => {
      args.command._[1] = name;
      return stor.call(this, args);
    });
  },
  syntax: '{{cmd}}',
  description: 'Store file uniquely'
};
