const Promise = require('bluebird');

module.exports = {
  directive: 'STOR',
  handler: function (connection, command) {
    if (!connection.fs) return connection.reply(550, 'File system not instantiated');
    if (!connection.fs.write) return connection.reply(402, 'Not supported by file system');

    const append = command.directive === 'APPE';
    const fileName = command.arg;

    return connection.connector.waitForConnection()
    .tap(() => connection.commandSocket.pause())
    .then(() => Promise.resolve(connection.fs.write(fileName, {append, start: connection.restByteCount})))
    .then(stream => {
      const destroyConnection = (conn, reject) => err => {
        if (conn) conn.destroy(err);
        reject(err);
      };

      const streamPromise = new Promise((resolve, reject) => {
        stream.once('error', destroyConnection(connection.connector.socket, reject));
        stream.once('finish', () => resolve());
      });

      const socketPromise = new Promise((resolve, reject) => {
        connection.connector.socket.on('data', data => {
          if (connection.connector.socket) connection.connector.socket.pause();
          if (stream) {
            stream.write(data, connection.transferType, () => connection.connector.socket && connection.connector.socket.resume());
          }
        });
        connection.connector.socket.once('end', () => {
          if (stream.listenerCount('close')) stream.emit('close');
          else stream.end();
          resolve();
        });
        connection.connector.socket.once('error', destroyConnection(stream, reject));
      });

      connection.restByteCount = 0;

      return connection.reply(150).then(() => connection.connector.socket.resume())
      .then(() => Promise.join(streamPromise, socketPromise))
      .tap(() => connection.emit('STOR', null, fileName))
      .finally(() => stream.destroy && stream.destroy());
    })
    .then(() => connection.reply(226, fileName))
    .catch(Promise.TimeoutError, err => {
      connection.emit('error', err);
      return connection.reply(425, 'No connection established');
    })
    .catch(err => {
      connection.emit('error', err);
      connection.emit('STOR', err);
      return connection.reply(550, err.message);
    })
    .finally(() => {
      connection.connector.end();
      connection.commandSocket.resume();
    });
  },
  syntax: '{{cmd}} <path>',
  description: 'Store data as a file at the server site'
};
