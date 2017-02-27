const when = require('when');
const {expect} = require('chai');
const sinon = require('sinon')

const CMD = 'AUTH';
describe(CMD, done => {
  let sandbox;
  const mockClient = {
    reply: () => when.resolve()
  };
  const CMDFN = require(`../../src/commands/${CMD.toLowerCase()}`).bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.spy(mockClient, 'reply');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('TLS // not supported', done => {
    CMDFN({command: {_: [CMD, 'TLS'], directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(504)
      done();
    })
    .catch(done);
  });

  it('SSL // not supported', done => {
    CMDFN({command: {_: [CMD, 'SSL'], directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(504)
      done();
    })
    .catch(done);
  });

  it('bad // bad', done => {
    CMDFN({command: {_: [CMD, 'bad'], directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(504)
      done();
    })
    .catch(done);
  });
});
