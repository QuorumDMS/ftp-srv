const _ = require('lodash');
const tls = require('tls');

module.exports = {
  directive: 'AUTH',
  handler: function (connection, command) {
    const method = _.upperCase(command.arg);

    switch (method) {
      case 'TLS': return handleTLS.call(this, connection);
      default: return connection.reply(504);
    }
  },
  syntax: '{{cmd}} <type>',
  description: 'Set authentication mechanism',
  flags: {
    no_auth: true,
    feat: 'AUTH TLS'
  }
};

function handleTLS(connection) {
  if (!connection.server._tls) return connection.reply(502);
  if (connection.secure) return connection.reply(202);

  return connection.reply(234)
  .then(() => {
    const secureContext = tls.createSecureContext(connection.server._tls);
    const secureSocket = new tls.TLSSocket(connection.commandSocket, {
      isServer: true,
      secureContext
    });
    ['data', 'timeout', 'end', 'close', 'drain', 'error'].forEach(event => {
      function forwardEvent() {
        connection.emit.apply(this, arguments);
      }
      secureSocket.on(event, forwardEvent.bind(connection.commandSocket, event));
    });
    connection.commandSocket = secureSocket;
    connection.secure = true;
  });
}
