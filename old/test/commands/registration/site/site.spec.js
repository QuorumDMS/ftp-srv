const Promise = require('bluebird');
const {expect} = require('chai');
const sinon = require('sinon');
const bunyan = require('bunyan');

const siteRegistry = require('../../../../src/commands/registration/site/registry');
const FtpCommands = require('../../../../src/commands');

const CMD = 'SITE';
describe(CMD, function () {
  let sandbox;
  const log = bunyan.createLogger({name: 'site-test'});
  const mockClient = {
    reply: () => Promise.resolve(),
    commands: new FtpCommands()
  };
  const cmdFn = require(`../../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create().usingPromise(Promise);

    sandbox.stub(mockClient, 'reply').resolves();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// unsuccessful', () => {
    return cmdFn({log})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(502);
    });
  });

  it('// unsuccessful', () => {
    return cmdFn({log, command: {arg: 'BAD'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(502);
    });
  });

  it('// successful', () => {
    sandbox.stub(siteRegistry.CHMOD, 'handler').resolves();

    return cmdFn({log, command: {arg: 'CHMOD test'}})
    .then(() => {
      const {command} = siteRegistry.CHMOD.handler.args[0][0];
      expect(command.directive).to.equal('CHMOD');
      expect(command.arg).to.equal('test');
    });
  });
});
