const Promise = require('bluebird');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'RNFR';
describe(CMD, function () {
  let sandbox;
  const mockLog = {error: () => {}};
  const mockClient = {reply: () => Promise.resolve()};
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create().usingPromise(Promise);

    mockClient.renameFrom = 'test';
    mockClient.fs = {
      get: () => Promise.resolve()
    };

    sandbox.spy(mockClient, 'reply');
    sandbox.spy(mockClient.fs, 'get');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// unsuccessful | no file system', () => {
    delete mockClient.fs;

    return cmdFn()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(550);
    });
  });

  it('// unsuccessful | file system does not have functions', () => {
    mockClient.fs = {};

    return cmdFn()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(402);
    });
  });

  it('test // unsuccessful | file get fails', () => {
    mockClient.fs.get.restore();
    sandbox.stub(mockClient.fs, 'get').rejects(new Error('test'));

    return cmdFn({log: mockLog, command: {arg: 'test'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(550);
    });
  });

  it('test // successful', () => {
    return cmdFn({log: mockLog, command: {arg: 'test'}})
    .then(() => {
      expect(mockClient.fs.get.args[0][0]).to.equal('test');
      expect(mockClient.reply.args[0][0]).to.equal(350);
    });
  });
});
