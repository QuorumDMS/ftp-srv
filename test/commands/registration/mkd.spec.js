const bunyan = require('bunyan');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'MKD';
describe(CMD, function () {
  let sandbox;
  let log = bunyan.createLogger({name: CMD});
  const mockClient = {
    reply: () => {},
    fs: { mkdir: () => {} }
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(mockClient, 'reply').resolves();
    sandbox.stub(mockClient.fs, 'mkdir').resolves();
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('// check', function () {
    it('fails on no fs', done => {
      const badMockClient = { reply: () => {} };
      const badCmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(badMockClient);
      sandbox.stub(badMockClient, 'reply').resolves();
      badCmdFn()
      .then(() => {
        expect(badMockClient.reply.args[0][0]).to.equal(550);
        done();
      })
      .catch(done);
    });

    it('fails on no fs mkdir command', done => {
      const badMockClient = { reply: () => {}, fs: {} };
      const badCmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(badMockClient);
      sandbox.stub(badMockClient, 'reply').resolves();
      badCmdFn()
      .then(() => {
        expect(badMockClient.reply.args[0][0]).to.equal(402);
        done();
      })
      .catch(done);
    });
  });

  it('test // successful', done => {
    cmdFn({log, command: {arg: 'test', directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(257);
      expect(mockClient.fs.mkdir.args[0][0]).to.equal('test');
      done();
    })
    .catch(done);
  });

  it('test // successful', done => {
    mockClient.fs.mkdir.restore();
    sandbox.stub(mockClient.fs, 'mkdir').resolves('test');
    cmdFn({log, command: {arg: 'test', directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(257);
      expect(mockClient.fs.mkdir.args[0][0]).to.equal('test');
      done();
    })
    .catch(done);
  });

  it('bad // unsuccessful', done => {
    mockClient.fs.mkdir.restore();
    sandbox.stub(mockClient.fs, 'mkdir').rejects(new Error('Bad'));

    cmdFn({log, command: {arg: 'bad', directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(550);
      expect(mockClient.fs.mkdir.args[0][0]).to.equal('bad');
      done();
    })
    .catch(done);
  });
});
