const Promise = require('bluebird');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'PBSZ';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => Promise.resolve(),
    server: {}
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.spy(mockClient, 'reply');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// unsuccessful', () => {
    return cmdFn(mockClient)
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(202);
    });
  });

  it('// successful', () => {
    mockClient.secure = true;
    mockClient.server._tls = {};

    return cmdFn(mockClient, {arg: '0'})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(200);
      expect(mockClient.bufferSize).to.equal(0);
    });
  });

  it('// successful', () => {
    mockClient.secure = true;
    mockClient.server._tls = {};

    return cmdFn(mockClient, {arg: '10'})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(200);
      expect(mockClient.bufferSize).to.equal(10);
    });
  });
});
