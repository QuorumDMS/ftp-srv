import { ConnectorError } from "../errors"

const MAX_PORT = 65535;
const MAX_PORT_CHECK_ATTEMPT = 5;

export function* portNumberGenerator(min, max = MAX_PORT) {
  let current = min;
  while (true) {
    if (current > MAX_PORT || current > max) {
      current = min;
    }
    yield current++;
  }
}

export function getNextPortFactory(host, portMin, portMax, maxAttempts = MAX_PORT_CHECK_ATTEMPT) {
  const nextPortNumber = portNumberGenerator(portMin, portMax);
  return () => new Promise((resolve, reject) => {
    const port = nextPortNumber.next().value;
    if (typeof port === 'number') {
      resolve(port);
    } else {
      reject(new ConnectorError('Unable to find valid port'));
    }
  });

}