const {expect} = require('chai');
const Promise = require('bluebird');
const bunyan = require('bunyan');
const sinon = require('sinon');

const FtpCommands = require('../../src/commands');

describe('FtpCommands', function () {
  let sandbox;
  let commands;
  let mockConnection = {
    authenticated: false,
    log: bunyan.createLogger({name: 'FtpCommands'}),
    reply: () => Promise.resolve({}),
    server: {
      options: {
        blacklist: ['allo']
      }
    }
  };

  beforeEach(() => {
    sandbox = sinon.sandbox.create().usingPromise(Promise);

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

    it('two args with quotes: test "hello world"', () => {
      const cmd = commands.parse('test "hello world"');
      expect(cmd.directive).to.equal('TEST');
      expect(cmd.arg).to.equal('hello world');
      expect(cmd.raw).to.equal('test "hello world"');
    });

    it('two args, with flags: test -l arg1 -A arg2 --zz88A', () => {
      const cmd = commands.parse('test -l arg1 -A arg2 --zz88A');
      expect(cmd.directive).to.equal('TEST');
      expect(cmd.arg).to.equal('arg1 arg2 --zz88A');
      expect(cmd.flags).to.deep.equal(['-l', '-A']);
      expect(cmd.raw).to.equal('test -l arg1 -A arg2 --zz88A');
    });

    it('one arg, with flags: list -l', () => {
      const cmd = commands.parse('list -l');
      expect(cmd.directive).to.equal('LIST');
      expect(cmd.arg).to.equal(null);
      expect(cmd.flags).to.deep.equal(['-l']);
      expect(cmd.raw).to.equal('list -l');
    });

    it('does not check for option flags', () => {
      const cmd = commands.parse('retr -test');
      expect(cmd.directive).to.equal('RETR');
      expect(cmd.arg).to.equal('-test');
      expect(cmd.flags).to.deep.equal([]);
    });
  });

  describe('handle', function () {
    it('fails with unsupported command', () => {
      return commands.handle('bad')
      .then(() => {
        expect(mockConnection.reply.callCount).to.equal(1);
        expect(mockConnection.reply.args[0][0]).to.equal(502);
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
