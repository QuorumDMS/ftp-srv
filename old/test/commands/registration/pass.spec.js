const bunyan = require('bunyan');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'PASS';
describe(CMD, function () {
  let sandbox;
  let log = bunyan.createLogger({name: CMD});
  const mockClient = {
    reply: () => {},
    login: () => {},
    server: {options: {anonymous: false}},
    username: 'anonymous'
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create().usingPromise(Promise);

    sandbox.stub(mockClient, 'reply').resolves();
    sandbox.stub(mockClient, 'login').resolves();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('pass // successful', () => {
    return cmdFn({log, command: {arg: 'pass', directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(230);
      expect(mockClient.login.args[0]).to.eql(['anonymous', 'pass']);
    });
  });

  it('// successful (already authenticated)', () => {
    mockClient.server.options.anonymous = true;
    mockClient.authenticated = true;
    return cmdFn({log, command: {directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(202);
      expect(mockClient.login.callCount).to.equal(0);
      mockClient.server.options.anonymous = false;
      mockClient.authenticated = false;
    });
  });

  it('bad // unsuccessful', () => {
    mockClient.login.restore();
    sandbox.stub(mockClient, 'login').rejects('bad');

    return cmdFn({log, command: {arg: 'bad', directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(530);
    });
  });

  it('bad // unsuccessful', () => {
    mockClient.login.restore();
    sandbox.stub(mockClient, 'login').rejects({});

    return cmdFn({log, command: {arg: 'bad', directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(530);
    });
  });

  it('bad // unsuccessful', () => {
    delete mockClient.username;
    return cmdFn({log, command: {arg: 'bad', directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(503);
    });
  });
});
