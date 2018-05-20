const list = require('./list').handler;

module.exports = {
  directive: 'NLST',
  handler: function () {
    return list.call(this, ...arguments);
  },
  syntax: '{{cmd}} [<path>]',
  description: 'Returns a list of file names in a specified directory'
};
