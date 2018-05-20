const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'CWD';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => {},
    fs: {chdir: () => {}}
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(mockClient, 'reply').resolves();
    sandbox.stub(mockClient.fs, 'chdir').resolves();
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('// check', function () {
    it('fails on no fs', () => {
      const badMockClient = {reply: () => {}};
      const badCmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler;
      sandbox.stub(badMockClient, 'reply').resolves();

      return badCmdFn(mockClient)
      .then(() => {
        expect(badMockClient.reply.args[0][0]).to.equal(550);
      });
    });

    it('fails on no fs chdir command', () => {
      const badMockClient = {reply: () => {}, fs: {}};
      const badCmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler;
      sandbox.stub(badMockClient, 'reply').resolves();

      return badCmdFn(badMockClient)
      .then(() => {
        expect(badMockClient.reply.args[0][0]).to.equal(402);
      });
    });
  });

  it('test // successful', () => {
    return cmdFn(mockClient, {arg: 'test', directive: CMD})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(250);
      expect(mockClient.fs.chdir.args[0][0]).to.equal('test');
    });
  });

  it('test // successful', () => {
    mockClient.fs.chdir.restore();
    sandbox.stub(mockClient.fs, 'chdir').resolves('/test');

    return cmdFn(mockClient, {arg: 'test', directive: CMD})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(250);
      expect(mockClient.fs.chdir.args[0][0]).to.equal('test');
    });
  });

  it('bad // unsuccessful', () => {
    mockClient.fs.chdir.restore();
    sandbox.stub(mockClient.fs, 'chdir').rejects(new Error('Bad'));

    return cmdFn(mockClient, {arg: 'bad', directive: CMD})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(550);
      expect(mockClient.fs.chdir.args[0][0]).to.equal('bad');
    });
  });
});
