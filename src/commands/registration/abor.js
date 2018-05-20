module.exports = {
  directive: 'ABOR',
  handler: function (connection) {
    return connection.connector.waitForConnection()
    .then(socket => {
      return connection.reply(426, {socket})
      .then(() => connection.connector.end())
      .then(() => connection.reply(226));
    })
    .catch(err => {
      connection.emit('error', err);
      return connection.reply(225);
    });
  },
  syntax: '{{cmd}}',
  description: 'Abort an active file transfer'
};
