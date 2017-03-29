const cwd = require('./cwd').handler;

module.exports = {
  directive: ['CDUP', 'XCUP'],
  handler: function (args) {
    args.command._ = [args.command._[0], '..'];
    return cwd.call(this, args);
  },
  syntax: '{{cmd}}',
  description: 'Change to Parent Directory'
};
