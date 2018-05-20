const PassiveConnector = require('../../connector/passive');

module.exports = {
  directive: 'PASV',
  handler: function (connection) {
    connection.connector = new PassiveConnector(connection);
    return connection.connector.setupServer()
    .then(server => {
      const address = connection.server.url.hostname;
      const {port} = server.address();
      const host = address.replace(/\./g, ',');
      const portByte1 = port / 256 | 0;
      const portByte2 = port % 256;

      return connection.reply(227, `PASV OK (${host},${portByte1},${portByte2})`);
    });
  },
  syntax: '{{cmd}}',
  description: 'Initiate passive mode'
};
