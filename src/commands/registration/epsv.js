const PassiveConnector = require('../../connector/passive');

module.exports = {
  directive: 'EPSV',
  handler: function ({log}) {
    this.connector = new PassiveConnector(this);
    return this.connector.setupServer()
    .then((server) => {
      const {port} = server.address();

      return this.reply(229, `EPSV OK (|||${port}|)`);
    })
    .catch((err) => {
      log.error(err);
      return this.reply(err.code || 425, err.message);
    });
  },
  syntax: '{{cmd}} [<protocol>]',
  description: 'Initiate passive mode'
};
