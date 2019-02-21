const Promise = require('bluebird');
const {expect} = require('chai');
const sinon = require('sinon');
const EventEmitter = require('events');

const CMD = 'RNTO';
describe(CMD, function () {
  let sandbox;
  const mockLog = {error: () => {}};
  let emitter;
  const mockClient = {reply: () => Promise.resolve()};
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create().usingPromise(Promise);

    mockClient.renameFrom = 'test';
    mockClient.fs = {
      get: () => Promise.resolve(),
      rename: () => Promise.resolve()
    };

    emitter = new EventEmitter();
    mockClient.emit = emitter.emit.bind(emitter);

    sandbox.spy(mockClient, 'reply');
    sandbox.spy(mockClient.fs, 'rename');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// unsuccessful | no renameFrom set', () => {
    delete mockClient.renameFrom;

    return cmdFn()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(503);
    });
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

  it('new // unsuccessful | rename fails', () => {
    mockClient.fs.rename.restore();
    sandbox.stub(mockClient.fs, 'rename').rejects(new Error('test'));

    return cmdFn({log: mockLog, command: {arg: 'new'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(550);
    });
  });

  it('new // successful', () => {
    return cmdFn({command: {arg: 'new'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(250);
      expect(mockClient.fs.rename.args[0]).to.eql(['test', 'new']);
    });
  });
});
