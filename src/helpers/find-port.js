const net = require('net');

const MAX_PORT = 65535;

function* portNumberGenerator(min, max = MAX_PORT) {
  let current = min;
  while (true) {
    if (current > MAX_PORT || current > max) {
      current = min;
    }
    yield current++;
  }
}

function getNextPortFactory(host, min, max) {
  const nextPortNumber = portNumberGenerator(min, max);
  const portCheckServer = net.createServer();
  portCheckServer.maxConnections = 0;

  return () => new Promise((resolve, reject) => {
    const tryGetPort = () => {
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

  // const nextPortNumber = portNumberGenerator(min, max);
  // const portCheckServer = net.createServer();
  // portCheckServer.maxConnections = 0;
  // portCheckServer.on('error', () => {
  //   portCheckServer.listen(nextPortNumber.next().value);
  // });

  // return () => new Promise((resolve) => {
  //   portCheckServer.once('listening', () => {
  //     const {port} = portCheckServer.address();
  //     portCheckServer.close(() => resolve(port));
  //   });
  //   portCheckServer.listen(nextPortNumber.next().value);
  // })
  // .catch(RangeError, (err) => Promise.reject(new errors.ConnectorError(err.message)));
}

module.exports = {
  getNextPortFactory,
  portNumberGenerator
};
