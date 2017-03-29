module.exports = {
  directive: 'QUIT',
  handler: function () {
    return this.close(221);
  },
  syntax: '{{cmd}}',
  description: 'Disconnect',
  flags: {
    no_auth: true
  }
};
