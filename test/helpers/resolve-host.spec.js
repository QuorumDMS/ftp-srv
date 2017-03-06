const {expect} = require('chai');
const resolveHost = require('../../src/helpers/resolve-host');

describe.only('helpers //resolve-host', function () {
  it('fetches ip address', done => {
    const hostname = '0.0.0.0';
    resolveHost(hostname)
    .then(resolvedHostname => {
      expect(resolvedHostname).to.match(/^\d+\.\d+\.\d+\.\d+$/);
      done();
    })
    .catch(done);
  });

  it('fetches ip address', done => {
    const hostname = null;
    resolveHost(hostname)
    .then(resolvedHostname => {
      expect(resolvedHostname).to.match(/^\d+\.\d+\.\d+\.\d+$/);
      done();
    })
    .catch(done);
  });

  it('does nothing', done => {
    const hostname = '127.0.0.1';
    resolveHost(hostname)
    .then(resolvedHostname => {
      expect(resolvedHostname).to.equal(hostname);
      done();
    })
    .catch(done);
  });
});
