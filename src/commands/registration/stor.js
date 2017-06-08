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
        stream.once('error', err => dataSocket.emit('error', err));
        stream.once('finish', () => resolve(this.reply(226, fileName)));

        // Emit `close` if stream has a close listener, otherwise emit `finish` with the end() method
        // It is assumed that the `close` handler will call the end() method
        dataSocket.once('end', () => stream.listenerCount('close') ? stream.emit('close') : stream.end());
        dataSocket.once('error', err => reject(err));
        dataSocket.on('data', data => stream.write(data, this.encoding));

        this.reply(150).then(() => dataSocket.resume());
      })
      .finally(() => when.try(stream.destroy.bind(stream)));
    })
    .catch(when.TimeoutError, err => {
      log.error(err);
      return this.reply(425, 'No connection established');
    })
    .catch(err => {
      log.error(err);
      return this.reply(550, err.message);
    })
    .finally(() => {
      this.connector.end();
      this.commandSocket.resume();
    });
  },
  syntax: '{{cmd}} <path>',
  description: 'Store data as a file at the server site'
};
