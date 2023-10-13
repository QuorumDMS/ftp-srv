const Promise = require('bluebird');
const path = require('path');
const _ = require('lodash');


module.exports = {
  directive: 'RNFR',
  handler: function ({log, command} = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.get) return this.reply(402, 'Not supported by file system');

    const fileName = command.arg;

    //过滤指定文件拓展名
    if (_.includes(this.server.options.deny_extension, _.lowerCase(path.extname(fileName))) ) {
      return this.reply(502, 'file extension blacklisted');
    }

    return Promise.try(() => this.fs.get(fileName))
    .then(() => {
      this.renameFrom = fileName;
      return this.reply(350);
    })
    .catch((err) => {
      log.error(err);
      return this.reply(550, err.message);
    });
  },
  syntax: '{{cmd}} <name>',
  description: 'Rename from'
};
