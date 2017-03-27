const when = require('when');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'SIZE';
describe(CMD, function () {
  let sandbox;
  const mockLog = { error: () => {} };
  const mockClient = { reply: () => when.resolve() };
  const cmdFn = require(`../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    mockClient.fs = {
      get: () => when.resolve({size: 1})
    };

    sandbox.spy(mockClient, 'reply');
  });
  afterEach(() => {
    sandbox.restore();
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

  it('// unsuccessful | file get fails', done => {
    sandbox.stub(mockClient.fs, 'get').rejects(new Error('test'));

    cmdFn({ log: mockLog, command: { _: [CMD, 'test'] } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(550);
      done();
    })
    .catch(done);
  });

  it('// successful', done => {
    cmdFn({ command: { _: [CMD, 'test'] } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(213);
      done();
    })
    .catch(done);
  });
});
