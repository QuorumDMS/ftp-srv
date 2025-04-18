export const stru = {
  directive: 'STRU',
  handler: function (data) {
    return this.reply(/^F$/i.test(data.command.arg) ? 200 : 504);
  },
  syntax: '{{cmd}} <structure>',
  description: 'Set file transfer structure',
  flags: {
    obsolete: true
  }
};
