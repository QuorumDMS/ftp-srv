const when = require('when');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'AUTH';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => when.resolve()
  };
  const cmdFn = require(`../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.spy(mockClient, 'reply');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('TLS // not supported', done => {
    cmdFn({command: {_: [CMD, 'TLS'], directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(504);
      done();
    })
    .catch(done);
  });

  it('SSL // not supported', done => {
    cmdFn({command: {_: [CMD, 'SSL'], directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(504);
      done();
    })
    .catch(done);
  });

  it('bad // bad', done => {
    cmdFn({command: {_: [CMD, 'bad'], directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(504);
      done();
    })
    .catch(done);
  });
});
