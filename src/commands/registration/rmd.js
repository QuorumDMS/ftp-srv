const {handler: dele} = require('./dele');

module.exports = {
  directive: ['RMD', 'XRMD'],
  handler: function (args) {
    return dele.call(this, args);
  },
  syntax: '{{cmd}} <path>',
  description: 'Remove a directory'
};
