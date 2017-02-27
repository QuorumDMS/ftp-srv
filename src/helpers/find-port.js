const net = require('net');
const when = require('when');
const errors = require('../errors');

module.exports = function (min = 22, max = undefined) {
  return when.promise((resolve, reject) => {
    let port = min;
    let portCheckServer = net.createServer();
    portCheckServer.maxConnections = 0;
    portCheckServer.on('error', () => {
      if (!max || port < max) {
        port = port + 1;
        portCheckServer.listen(port);
      } else {
        reject(new errors.GeneralError('Unable to find open port', 500));
      }
    })
    portCheckServer.on('listening', () => {
      const {port} = portCheckServer.address();
      portCheckServer.close(() => {
        portCheckServer = null;
        resolve(port);
      });
    });
    portCheckServer.listen(port);
  });
};
