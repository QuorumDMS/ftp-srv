const cwd = require('./cwd');

module.exports = function(args) {
  args.command._ = [args.command._[0], '..'];
  return cwd.call(this, args);
}
