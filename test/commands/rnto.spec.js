const when = require('when');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'RNTO';
describe(CMD, function () {
  let sandbox;
  const mockLog = { error: () => {} };
  const mockClient = { reply: () => when.resolve() };
  const cmdFn = require(`../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    mockClient.renameFrom = 'test';
    mockClient.fs = {
      get: () => when.resolve(),
      rename: () => when.resolve()
    };

    sandbox.spy(mockClient, 'reply');
    sandbox.spy(mockClient.fs, 'rename');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// unsuccessful | no renameFrom set', done => {
    delete mockClient.renameFrom;

    cmdFn()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(503);
      done();
    })
    .catch(done);
  });

  it('// unsuccessful | no file system', done => {
    delete mockClient.fs;

    cmdFn()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(550);
      done();
    })
    .catch(done);
  });

  it('// unsuccessful | file system does not have functions', done => {
    mockClient.fs = {};

    cmdFn()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(402);
      done();
    })
    .catch(done);
  });

  it('new // unsuccessful | rename fails', done => {
    mockClient.fs.rename.restore();
    sandbox.stub(mockClient.fs, 'rename').rejects(new Error('test'));

    cmdFn({ log: mockLog, command: { _: [CMD, 'new'] } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(550);
      done();
    })
    .catch(done);
  });

  it('new // successful', done => {
    cmdFn({ command: { _: [CMD, 'new'] } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(250);
      expect(mockClient.fs.rename.args[0]).to.eql(['test', 'new']);
      done();
    })
    .catch(done);
  });
});
