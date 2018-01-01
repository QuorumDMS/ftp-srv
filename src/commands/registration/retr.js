const when = require('when');

module.exports = {
  directive: 'RETR',
  handler: function ({log, command} = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.read) return this.reply(402, 'Not supported by file system');

    return this.connector.waitForConnection()
    .tap(() => this.commandSocket.pause())
    .then(() => when.try(this.fs.read.bind(this.fs), command.arg, {start: this.restByteCount}))
    .then(stream => {
      const destroyConnection = (connection, reject) => err => connection && connection.destroy(err) && reject(err);

      const eventsPromise = when.promise((resolve, reject) => {
        stream.on('data', data => {
          if (stream) stream.pause();
          if (this.connector.socket) {
            this.connector.socket.write(data, this.transferType, () => stream && stream.resume());
          }
        });
        stream.once('end', () => resolve());
        stream.once('error', destroyConnection(this.connector.socket, reject));

        this.connector.socket.once('error', destroyConnection(stream, reject));
      });

      this.restByteCount = 0;

      return this.reply(150).then(() => stream.resume() && this.connector.socket.resume())
      .then(() => eventsPromise)
      .finally(() => stream.destroy && stream.destroy());
    })
    .then(() => this.reply(226))
    .catch(when.TimeoutError, err => {
      log.error(err);
      return this.reply(425, 'No connection established');
    })
    .catch(err => {
      log.error(err);
      return this.reply(551, err.message);
    })
    .finally(() => {
      this.connector.end();
      this.commandSocket.resume();
    });
  },
  syntax: '{{cmd}} <path>',
  description: 'Retrieve a copy of the file'
};
