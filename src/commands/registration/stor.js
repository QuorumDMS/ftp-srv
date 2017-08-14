const when = require('when');

module.exports = {
  directive: 'STOR',
  handler: function ({log, command} = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.write) return this.reply(402, 'Not supported by file system');

    const append = command.directive === 'APPE';
    const fileName = command.arg;

    return this.connector.waitForConnection()
    .tap(() => this.commandSocket.pause())
    .then(() => when.try(this.fs.write.bind(this.fs), fileName, {append, start: this.restByteCount}))
    .then(stream => {
      this.restByteCount = 0;
      return when.promise((resolve, reject) => {
        stream.once('error', err => this.connector.socket.emit('error', err));
        stream.once('finish', () => resolve(this.reply(226, fileName)));

        // Emit `close` if stream has a close listener, otherwise emit `finish` with the end() method
        // It is assumed that the `close` handler will call the end() method
        this.connector.socket.once('end', () => stream.listenerCount('close') ? stream.emit('close') : stream.end());
        this.connector.socket.once('error', err => reject(err));
        this.connector.socket.on('data', data => stream.write(data, this.transferType));

        this.reply(150).then(() => this.connector.socket.resume());
      })
      .finally(() => stream.destroy ? when.try(stream.destroy.bind(stream)) : null);
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
