const Promise = require('bluebird');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'ALLO';
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
    return cmdFn()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(202);
    });
  });
});
