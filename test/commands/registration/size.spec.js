const Promise = require('bluebird');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'SIZE';
describe(CMD, function () {
  let sandbox;
  const mockClient = {reply: () => Promise.resolve()};
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    mockClient.fs = {
      get: () => Promise.resolve({size: 1})
    };

    sandbox.spy(mockClient, 'reply');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// unsuccessful | no file system', () => {
    delete mockClient.fs;

    return cmdFn(mockClient)
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(550);
    });
  });

  it('// unsuccessful | file system does not have functions', () => {
    mockClient.fs = {};

    return cmdFn(mockClient)
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(402);
    });
  });

  it('// unsuccessful | file get fails', () => {
    sandbox.stub(mockClient.fs, 'get').rejects(new Error('test'));

    return cmdFn(mockClient, {arg: 'test'})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(550);
    });
  });

  it('// successful', () => {
    return cmdFn(mockClient, {arg: 'test'})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(213);
    });
  });
});
