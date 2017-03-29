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

  it('finds a port', done => {
    findPort(1)
    .then(port => {
      expect(Server.prototype.listen.callCount).to.be.above(1);
      expect(port).to.be.above(1);
      done();
    })
    .catch(done);
  });

  it('does not find a port', done => {
    findPort(1, 2)
    .then(() => done('no'))
    .catch(err => {
      expect(err).to.exist;
      done();
    });
  });
});
