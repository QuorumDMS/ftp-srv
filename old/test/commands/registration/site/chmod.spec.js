const Promise = require('bluebird');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'CHMOD';
describe(CMD, function () {
  let sandbox;
  const mockLog = {error: () => {}};
  const mockClient = {reply: () => Promise.resolve()};
  const cmdFn = require(`../../../../src/commands/registration/site/${CMD.toLowerCase()}`).bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create().usingPromise(Promise);

    mockClient.fs = {
      chmod: () => Promise.resolve()
    };

    sandbox.spy(mockClient, 'reply');
    sandbox.spy(mockClient.fs, 'chmod');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// unsuccessful | no file system', (done) => {
    delete mockClient.fs;

    cmdFn()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(550);
      done();
    })
    .catch(done);
  });

  it('// unsuccessful | file system does not have functions', (done) => {
    mockClient.fs = {};

    cmdFn()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(402);
      done();
    })
    .catch(done);
  });

  it('777 test // unsuccessful | file chmod fails', (done) => {
    mockClient.fs.chmod.restore();
    sandbox.stub(mockClient.fs, 'chmod').rejects(new Error('test'));

    cmdFn({log: mockLog, command: {arg: '777 test'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(500);
      done();
    })
    .catch(done);
  });

  it('777 test // successful', (done) => {
    cmdFn({log: mockLog, command: {arg: '777 test'}})
    .then(() => {
      expect(mockClient.fs.chmod.args[0]).to.eql(['test', 511]);
      expect(mockClient.reply.args[0][0]).to.equal(200);
      done();
    })
    .catch(done);
  });
});
