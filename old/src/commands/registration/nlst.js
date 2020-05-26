const list = require('./list').handler;

module.exports = {
  directive: 'NLST',
  handler: function (args) {
    return list.call(this, args);
  },
  syntax: '{{cmd}} [<path>]',
  description: 'Returns a list of file names in a specified directory'
};
