/* eslint no-unused-expressions: 0 */
const {expect} = require('chai');
const {Server} = require('net');
const sinon = require('sinon');

const findPort = require('../../src/helpers/find-port');

describe('helpers // find-port', function () {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.spy(Server.prototype, 'listen');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('finds a port', () => {
    return findPort(1)
    .then(port => {
      expect(Server.prototype.listen.callCount).to.be.above(0);
      expect(port).to.be.above(0);
    });
  });

  it('does not find a port', () => {
    return findPort(1, 2)
    .then(() => expect(1).to.equal(2)) // should not happen
    .catch(err => {
      expect(err).to.exist;
    });
  });
});
