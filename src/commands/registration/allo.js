module.exports = {
  directive: 'ALLO',
  handler: function (connection) {
    return connection.reply(202);
  },
  syntax: '{{cmd}}',
  description: 'Allocate sufficient disk space to receive a file',
  flags: {
    obsolete: true
  }
};
