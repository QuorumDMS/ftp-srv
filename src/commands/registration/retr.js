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
      this.restByteCount = 0;

      const eventsPromise = when.promise((resolve, reject) => {
        this.connector.socket.once('error', err => reject(err));

        stream.on('data', data => {
          stream.pause()
          this.connector.socket
            && this.connector.socket.write(data, this.transferType, function(){
              stream.resume()
            })
        });
        
        stream.once('error', err => {
          // DESTROY STREAM WHEN ERROR HAPPENED
          if(stream.destroy)
            stream.destroy()
          return reject(err)
        });
        stream.once('end', () => resolve());
      });

      return this.reply(150).then(() => this.connector.socket.resume())
      .then(() => eventsPromise)
      .finally(() => stream.destroy ? stream.destroy() : null);
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
