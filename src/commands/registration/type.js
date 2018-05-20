module.exports = {
  directive: 'TYPE',
  handler: function (connection, command) {
    if (/^A[0-9]?$/i.test(command.arg)) {
      connection.transferType = 'ascii';
    } else if (/^L[0-9]?$/i.test(command.arg) || /^I$/i.test(command.arg)) {
      connection.transferType = 'binary';
    } else {
      return connection.reply(501);
    }
    return connection.reply(200, `Switch to "${connection.transferType}" transfer mode.`);
  },
  syntax: '{{cmd}} <mode>',
  description: 'Set the transfer mode, binary (I) or ascii (A)',
  flags: {
    feat: 'TYPE A,I,L'
  }
};
