const net = require('net');
const errors = require('../errors');

const MAX_PORT = 65535;
const MAX_PORT_CHECK_ATTEMPT = 5;

function* portNumberGenerator(min, max = MAX_PORT) {
  let current = min;
  while (true) {
    if (current > MAX_PORT || current > max) {
      current = min;
    }
    yield current++;
  }
}

function getNextPortFactory(host, portMin, portMax, maxAttempts = MAX_PORT_CHECK_ATTEMPT) {
  const nextPortNumber = portNumberGenerator(portMin, portMax);

  return () => new Promise((resolve, reject) => {
    const portCheckServer = net.createServer();
    portCheckServer.maxConnections = 0;

    let attemptCount = 0;
    const tryGetPort = () => {
      attemptCount++;
      if (attemptCount > maxAttempts) {
        reject(new errors.ConnectorError('Unable to find valid port'));
        return;
      }

      const {value: port} = nextPortNumber.next();

      portCheckServer.removeAllListeners();
      portCheckServer.once('error', (err) => {
        if (['EADDRINUSE'].includes(err.code)) {
          tryGetPort();
        } else {
          reject(err);
        }
      });
      portCheckServer.once('listening', () => {
        portCheckServer.removeAllListeners();
        portCheckServer.close(() => resolve(port));
      });

      try {
        portCheckServer.listen(port, host);
      } catch (err) {
        reject(err);
      }
    };

    tryGetPort();
  });
}

module.exports = {
  getNextPortFactory,
  portNumberGenerator
};
