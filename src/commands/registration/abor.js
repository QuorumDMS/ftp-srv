module.exports = {
  directive: 'ABOR',
  handler: function () {
    return this.connector.waitForConnection()
    .then(socket => {
      return this.reply(426, {socket})
      .then(() => this.connector.end())
      .then(() => this.reply(226));
    })
    .catch(() => this.reply(225));
  },
  syntax: '{{cmd}}',
  description: 'Abort an active file transfer'
};
