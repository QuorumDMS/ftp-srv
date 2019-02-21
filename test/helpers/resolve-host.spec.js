const {expect} = require('chai');
const sinon = require('sinon');
const resolveHost = require('../../src/helpers/resolve-host');

describe('helpers //resolve-host', function () {
  this.timeout(4000);

  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create().usingPromise(Promise);
  });
  afterEach(() => sandbox.restore());

  it('fetches ip address', () => {
    const hostname = '0.0.0.0';
    return resolveHost(hostname)
    .then((resolvedHostname) => {
      expect(resolvedHostname).to.match(/^\d+\.\d+\.\d+\.\d+$/);
    });
  });

  it('fetches ip address', () => {
    const hostname = null;
    return resolveHost(hostname)
    .then((resolvedHostname) => {
      expect(resolvedHostname).to.match(/^\d+\.\d+\.\d+\.\d+$/);
    });
  });

  it('does nothing', () => {
    const hostname = '127.0.0.1';
    return resolveHost(hostname)
    .then((resolvedHostname) => {
      expect(resolvedHostname).to.equal(hostname);
    });
  });

  it('fails on getting hostname', () => {
    sandbox.stub(require('http'), 'get').callsFake(function (url, cb) {
      cb({
        statusCode: 420
      });
    });

    return resolveHost(null)
    .then(() => expect(1).to.equal(2))
    .catch((err) => {
      expect(err.code).to.equal(420);
    });
  });
});
