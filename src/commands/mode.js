module.exports = function ({command} = {}) {
  return this.reply(command._[1] === 'S' ? 200 : 504);
}
