const stor = require('./stor').handler;

module.exports = {
  directive: 'APPE',
  handler: function (args) {
    return stor.call(this, args);
  },
  syntax: '{{cmd}} <path>',
  description: 'Append to a file'
};
