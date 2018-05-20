module.exports = {
  directive: 'QUIT',
  handler: function (connection) {
    return connection.close(221, 'Client called QUIT');
  },
  syntax: '{{cmd}}',
  description: 'Disconnect',
  flags: {
    no_auth: true
  }
};
