const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'PWD';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => {},
    fs: {currentDirectory: () => {}}
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(mockClient, 'reply').resolves();
    sandbox.stub(mockClient.fs, 'currentDirectory').resolves();
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('// check', function () {
    it('fails on no fs', () => {
      const badMockClient = {reply: () => {}};
      const badCmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(badMockClient);
      sandbox.stub(badMockClient, 'reply').resolves();

      return badCmdFn(badMockClient)
      .then(() => {
        expect(badMockClient.reply.args[0][0]).to.equal(550);
      });
    });

    it('fails on no fs currentDirectory command', () => {
      const badMockClient = {reply: () => {}, fs: {}};
      const badCmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(badMockClient);
      sandbox.stub(badMockClient, 'reply').resolves();

      return badCmdFn(badMockClient)
      .then(() => {
        expect(badMockClient.reply.args[0][0]).to.equal(402);
      });
    });
  });

  it('// successful', () => {
    return cmdFn(mockClient, {arg: 'test', directive: CMD})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(257);
    });
  });

  it('// successful', () => {
    mockClient.fs.currentDirectory.restore();
    sandbox.stub(mockClient.fs, 'currentDirectory').resolves('/test');

    return cmdFn(mockClient, {arg: 'test', directive: CMD})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(257);
    });
  });

  it('// unsuccessful', () => {
    mockClient.fs.currentDirectory.restore();
    sandbox.stub(mockClient.fs, 'currentDirectory').rejects(new Error('Bad'));

    return cmdFn(mockClient, {arg: 'bad', directive: CMD})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(550);
    });
  });
});
