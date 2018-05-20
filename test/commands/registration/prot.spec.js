const Promise = require('bluebird');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'PROT';
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

  it('// unsuccessful - no bufferSize', () => {
    mockClient.server._tls = {};
    mockClient.secure = true;

    return cmdFn(mockClient, {arg: 'P'})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(503);
    });
  });

  it('// successful', () => {
    mockClient.bufferSize = 0;
    mockClient.secure = true;

    return cmdFn(mockClient, {arg: 'p'})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(200);
    });
  });

  it('// unsuccessful - unsupported', () => {
    mockClient.secure = true;
    return cmdFn(mockClient, {arg: 'C'})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(536);
    });
  });

  it('// unsuccessful - unknown', () => {
    mockClient.secure = true;
    return cmdFn(mockClient, {arg: 'QQ'})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(504);
    });
  });
});
