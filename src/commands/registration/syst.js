module.exports = {
  directive: 'SYST',
  handler: function (connection) {
    return connection.reply(215);
  },
  syntax: '{{cmd}}',
  description: 'Return system type',
  flags: {
    no_auth: true
  }
};
