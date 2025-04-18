export const pbsz = {
  directive: 'PBSZ',
  handler: function (data) {
    if (!this.secure) return this.reply(202, 'Not supported');
    this.bufferSize = parseInt(data.command.arg, 10);
    return this.reply(200, this.bufferSize === 0 ? 'OK' : 'Buffer too large: PBSZ=0');
  },
  syntax: '{{cmd}}',
  description: 'Protection Buffer Size',
  flags: {
    no_auth: true,
    feat: 'PBSZ'
  }
};
