const _ = require('lodash');
const ActiveConnector = require('../../connector/active');

module.exports = {
  directive: 'PORT',
  handler: function (connection, command) {
    connection.connector = new ActiveConnector(connection);

    const rawConnection = _.get(command, 'arg', '').split(',');
    if (rawConnection.length !== 6) return connection.reply(425);

    const ip = rawConnection.slice(0, 4).join('.');
    const portBytes = rawConnection.slice(4).map(p => parseInt(p));
    const port = portBytes[0] * 256 + portBytes[1];

    return connection.connector.setupConnection(ip, port)
    .then(() => connection.reply(200));
  },
  syntax: '{{cmd}} <x>,<x>,<x>,<x>,<y>,<y>',
  description: 'Specifies an address and port to which the server should connect'
};
