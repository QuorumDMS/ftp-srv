const stor = require('./stor').handler;

module.exports = {
  directive: 'APPE',
  handler: function () {
    return stor.call(this, ...arguments);
  },
  syntax: '{{cmd}} <path>',
  description: 'Append to a file'
};
