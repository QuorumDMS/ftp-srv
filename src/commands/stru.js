module.exports = function ({command} = {}) {
  return this.reply(command._[1] === 'F' ? 200 : 504);
}
