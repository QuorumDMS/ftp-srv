module.exports = {
  directive: 'ALLO',
  handler: function () {
    return this.reply(202);
  },
  syntax: '{{cmd}}',
  description: 'Allocate sufficient disk space to receive a file',
  flags: {
    obsolete: true
  }
};
