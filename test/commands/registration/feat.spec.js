const Promise = require('bluebird');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'FEAT';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => Promise.resolve()
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create().usingPromise(Promise);

    sandbox.spy(mockClient, 'reply');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// successful', () => {
    return cmdFn({command: {directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(211);
      expect(mockClient.reply.args[0][2].message).to.equal(' AUTH TLS');
    });
  });
});
