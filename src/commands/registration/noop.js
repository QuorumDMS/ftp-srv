module.exports = {
  directive: 'NOOP',
  handler: function (connection) {
    return connection.reply(200);
  },
  syntax: '{{cmd}}',
  description: 'No operation',
  flags: {
    no_auth: true
  }
};
