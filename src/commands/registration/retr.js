const Promise = require('bluebird');

module.exports = {
  directive: 'RETR',
  handler: function (connection, command) {
    if (!connection.fs) return connection.reply(550, 'File system not instantiated');
    if (!connection.fs.read) return connection.reply(402, 'Not supported by file system');

    const filePath = command.arg;

    return connection.connector.waitForConnection()
    .tap(() => connection.commandSocket.pause())
    .then(() => Promise.resolve(connection.fs.read(filePath, {start: connection.restByteCount})))
    .then(stream => {
      const destroyConnection = (conn, reject) => err => {
        if (conn) conn.destroy(err);
        reject(err);
      };

      const eventsPromise = new Promise((resolve, reject) => {
        stream.on('data', data => {
          if (stream) stream.pause();
          if (connection.connector.socket) {
            connection.connector.socket.write(data, connection.transferType, () => stream && stream.resume());
          }
        });
        stream.once('end', () => resolve());
        stream.once('error', destroyConnection(connection.connector.socket, reject));

        connection.connector.socket.once('error', destroyConnection(stream, reject));
      });

      connection.restByteCount = 0;

      return connection.reply(150).then(() => stream.resume() && connection.connector.socket.resume())
      .then(() => eventsPromise)
      .tap(() => connection.emit('RETR', null, filePath))
      .finally(() => stream.destroy && stream.destroy());
    })
    .then(() => connection.reply(226))
    .catch(Promise.TimeoutError, err => {
      connection.emit('error', err);
      return connection.reply(425, 'No connection established');
    })
    .catch(err => {
      connection.emit('error', err);
      connection.emit('RETR', err);
      return connection.reply(551, err.message);
    })
    .finally(() => {
      connection.connector.end();
      connection.commandSocket.resume();
    });
  },
  syntax: '{{cmd}} <path>',
  description: 'Retrieve a copy of the file'
};
