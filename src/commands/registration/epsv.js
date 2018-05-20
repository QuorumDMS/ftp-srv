const PassiveConnector = require('../../connector/passive');

module.exports = {
  directive: 'EPSV',
  handler: function (connection) {
    connection.connector = new PassiveConnector(connection);
    return connection.connector.setupServer()
    .then(server => {
      const {port} = server.address();

      return connection.reply(229, `EPSV OK (|||${port}|)`);
    });
  },
  syntax: '{{cmd}} [<protocol>]',
  description: 'Initiate passive mode'
};
