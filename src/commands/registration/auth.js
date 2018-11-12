const _ = require('lodash');
const tls = require('tls');

module.exports = {
  directive: 'AUTH',
  handler: function ({command} = {}) {
    const method = _.upperCase(command.arg);

    switch (method) {
      case 'TLS': return handleTLS.call(this);
      default: return this.reply(504);
    }
  },
  syntax: '{{cmd}} <type>',
  description: 'Set authentication mechanism',
  flags: {
    no_auth: true,
    feat: 'AUTH TLS'
  }
};

function handleTLS() {
  if (!this.server.options.tls) return this.reply(502);
  if (this.secure) return this.reply(202);

  return this.reply(234)
  .then(() => {
    const secureContext = tls.createSecureContext(this.server.options.tls);
    const secureSocket = new tls.TLSSocket(this.commandSocket, {
      isServer: true,
      secureContext
    });
    ['data', 'timeout', 'end', 'close', 'drain', 'error'].forEach((event) => {
      function forwardEvent() {
        this.emit.apply(this, arguments);
      }
      secureSocket.on(event, forwardEvent.bind(this.commandSocket, event));
    });
    this.commandSocket = secureSocket;
    this.secure = true;
  });
}
