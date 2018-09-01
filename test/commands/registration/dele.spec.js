const bunyan = require('bunyan');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'DELE';
describe(CMD, function () {
  let sandbox;
  let log = bunyan.createLogger({name: CMD});
  const mockClient = {
    reply: () => {},
    fs: {delete: () => {}}
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create().usingPromise(Promise);

    sandbox.stub(mockClient, 'reply').resolves();
    sandbox.stub(mockClient.fs, 'delete').resolves();
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('// check', function () {
    it('fails on no fs', () => {
      const badMockClient = {reply: () => {}};
      const badCmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(badMockClient);
      sandbox.stub(badMockClient, 'reply').resolves();

      return badCmdFn()
      .then(() => {
        expect(badMockClient.reply.args[0][0]).to.equal(550);
      });
    });

    it('fails on no fs delete command', () => {
      const badMockClient = {reply: () => {}, fs: {}};
      const badCmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(badMockClient);
      sandbox.stub(badMockClient, 'reply').resolves();

      return badCmdFn()
      .then(() => {
        expect(badMockClient.reply.args[0][0]).to.equal(402);
      });
    });
  });

  it('test // successful', () => {
    return cmdFn({log, command: {arg: 'test', directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(250);
      expect(mockClient.fs.delete.args[0][0]).to.equal('test');
    });
  });

  it('bad // unsuccessful', () => {
    mockClient.fs.delete.restore();
    sandbox.stub(mockClient.fs, 'delete').rejects(new Error('Bad'));

    return cmdFn({log, command: {arg: 'bad', directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(550);
      expect(mockClient.fs.delete.args[0][0]).to.equal('bad');
    });
  });
});
