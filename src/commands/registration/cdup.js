const cwd = require('./cwd').handler;

module.exports = {
  directive: ['CDUP', 'XCUP'],
  handler: function (connection, command, ...args) {
    command.arg = '..';
    return cwd.call(this, connection, command, ...args);
  },
  syntax: '{{cmd}}',
  description: 'Change to Parent Directory'
};
