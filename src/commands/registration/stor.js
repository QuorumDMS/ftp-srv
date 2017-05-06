const when = require('when');

module.exports = {
  directive: 'STOR',
  handler: function ({log, command} = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.write) return this.reply(402, 'Not supported by file system');

    const append = command.directive === 'APPE';
    const fileName = command.arg;

    let dataSocket;
    return this.connector.waitForConnection()
    .then(socket => {
      this.commandSocket.pause();
      dataSocket = socket;
    })
    .then(() => when.try(this.fs.write.bind(this.fs), fileName, {append}))
    .then(stream => {
      return when.promise((resolve, reject) => {
        stream.on('error', err => dataSocket.emit('error', err));

        dataSocket.on('end', () => stream.end(() => resolve(this.reply(226, fileName))));
        dataSocket.on('error', err => reject(err));
        dataSocket.on('data', data => stream.write(data, this.encoding));
        this.reply(150).then(() => dataSocket.resume());
      });
    })
    .catch(when.TimeoutError, err => {
      log.error(err);
      return this.reply(425, 'No connection established');
    })
    .catch(err => {
      log.error(err);
      return this.reply(553);
    })
    .finally(() => {
      this.connector.end();
      this.commandSocket.resume();
    });
  },
  syntax: '{{cmd}} [path]',
  description: 'Store data as a file at the server site'
};
