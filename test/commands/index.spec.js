const {expect} = require('chai');
const when = require('when');
const bunyan = require('bunyan');
const sinon = require('sinon');

const FtpCommands = require('../../src/commands');

describe('FtpCommands', function () {
  let sandbox;
  let commands;
  let mockConnection = {
    authenticated: false,
    log: bunyan.createLogger({name: 'FtpCommands'}),
    reply: () => when.resolve({}),
    server: {
      options: {
        blacklist: ['allo']
      }
    }
  };

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    commands = new FtpCommands(mockConnection);

    sandbox.spy(mockConnection, 'reply');
    sandbox.spy(commands, 'handle');
    sandbox.spy(commands, 'parse');
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('parse', function () {
    it('no args: test', () => {
      const cmd = commands.parse('test');
      expect(cmd.directive).to.equal('TEST');
      expect(cmd.arg).to.equal(null);
      expect(cmd.raw).to.equal('test');
    });

    it('one arg: test arg', () => {
      const cmd = commands.parse('test arg');
      expect(cmd.directive).to.equal('TEST');
      expect(cmd.arg).to.equal('arg');
      expect(cmd.raw).to.equal('test arg');
    });

    it('two args: test arg1 arg2', () => {
      const cmd = commands.parse('test arg1 arg2');
      expect(cmd.directive).to.equal('TEST');
      expect(cmd.arg).to.equal('arg1 arg2');
      expect(cmd.raw).to.equal('test arg1 arg2');
    });
  });

  describe('handle', function () {
    it('fails with unsupported command', () => {
      return commands.handle('bad')
      .then(() => {
        expect(mockConnection.reply.callCount).to.equal(1);
        expect(mockConnection.reply.args[0][0]).to.equal(402);
      });
    });

    it('fails with blacklisted command', () => {
      return commands.handle('allo')
      .then(() => {
        expect(mockConnection.reply.callCount).to.equal(1);
        expect(mockConnection.reply.args[0][0]).to.equal(502);
        expect(mockConnection.reply.args[0][1]).to.match(/blacklisted/);
      });
    });

    it('fails with non whitelisted command', () => {
      commands.whitelist.push('USER');
      return commands.handle('auth')
      .then(() => {
        expect(mockConnection.reply.callCount).to.equal(1);
        expect(mockConnection.reply.args[0][0]).to.equal(502);
        expect(mockConnection.reply.args[0][1]).to.match(/whitelisted/);
      });
    });

    it('fails due to being unauthenticated', () => {
      return commands.handle('stor')
      .then(() => {
        expect(mockConnection.reply.callCount).to.equal(1);
        expect(mockConnection.reply.args[0][0]).to.equal(530);
        expect(mockConnection.reply.args[0][1]).to.match(/authentication/);
      });
    });
  });
});
