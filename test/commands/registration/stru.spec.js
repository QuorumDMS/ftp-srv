const when = require('when');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'STRU';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => when.resolve()
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.spy(mockClient, 'reply');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// successful', done => {
    cmdFn({command: { arg: 'F' } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(200);
      done();
    })
    .catch(done);
  });

  it('// unsuccessful', done => {
    cmdFn({command: { arg: 'X' } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(504);
      done();
    })
    .catch(done);
  });
});
