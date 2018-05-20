const Promise = require('bluebird');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'CDUP';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => Promise.resolve(),
    fs: {
      chdir: () => Promise.resolve()
    }
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.spy(mockClient, 'reply');
    sandbox.spy(mockClient.fs, 'chdir');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('.. // successful', () => {
    return cmdFn(mockClient, {directive: CMD})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(250);
      expect(mockClient.fs.chdir.args[0][0]).to.equal('..');
    });
  });
});
