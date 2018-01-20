const Promise = require('bluebird');

module.exports = {
  directive: 'STOR',
  handler: function ({log, command} = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.write) return this.reply(402, 'Not supported by file system');

    const append = command.directive === 'APPE';
    const fileName = command.arg;

    return this.connector.waitForConnection()
    .tap(() => this.commandSocket.pause())
    .then(() => Promise.resolve(this.fs.write(fileName, {append, start: this.restByteCount})))
    .then(stream => {
      const destroyConnection = (connection, reject) => err => {
        if (connection) connection.destroy(err);
        reject(err);
      };

      const streamPromise = new Promise((resolve, reject) => {
        stream.once('error', destroyConnection(this.connector.socket, reject));
        stream.once('finish', () => resolve());
      });

      const socketPromise = new Promise((resolve, reject) => {
        this.connector.socket.on('data', data => {
          if (this.connector.socket) this.connector.socket.pause();
          if (stream) {
            stream.write(data, this.transferType, () => this.connector.socket && this.connector.socket.resume());
          }
        });
        this.connector.socket.once('end', () => {
          if (stream.listenerCount('close')) stream.emit('close');
          else stream.end();
          resolve();
        });
        this.connector.socket.once('error', destroyConnection(stream, reject));
      });

      this.restByteCount = 0;

      return this.reply(150).then(() => this.connector.socket.resume())
      .then(() => Promise.join(streamPromise, socketPromise))
      .tap(() => this.emit('STOR', null, fileName))
      .finally(() => stream.destroy && stream.destroy());
    })
    .then(() => this.reply(226, fileName))
    .catch(Promise.TimeoutError, err => {
      log.error(err);
      return this.reply(425, 'No connection established');
    })
    .catch(err => {
      log.error(err);
      this.emit('STOR', err);
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
