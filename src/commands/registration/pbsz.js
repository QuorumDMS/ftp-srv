module.exports = {
  directive: 'PBSZ',
  handler: function (connection, command) {
    if (!connection.secure) return connection.reply(202, 'Not suppored');
    connection.bufferSize = parseInt(command.arg, 10);
    return connection.reply(200, connection.bufferSize === 0 ? 'OK' : 'Buffer too large: PBSZ=0');
  },
  syntax: '{{cmd}}',
  description: 'Protection Buffer Size',
  flags: {
    no_auth: true,
    feat: 'PBSZ'
  }
};
