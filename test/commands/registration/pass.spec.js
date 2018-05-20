const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'PASS';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => {},
    login: () => {},
    server: {options: {anonymous: false}},
    username: 'anonymous'
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(mockClient, 'reply').resolves();
    sandbox.stub(mockClient, 'login').resolves();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('pass // successful', () => {
    return cmdFn(mockClient, {arg: 'pass', directive: CMD})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(230);
      expect(mockClient.login.args[0]).to.eql(['anonymous', 'pass']);
    });
  });

  it('// successful (already authenticated)', () => {
    mockClient.server.options.anonymous = true;
    mockClient.authenticated = true;
    return cmdFn(mockClient, {directive: CMD})
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

    return cmdFn(mockClient, {arg: 'bad', directive: CMD})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(530);
    });
  });

  it('bad // unsuccessful', () => {
    mockClient.login.restore();
    sandbox.stub(mockClient, 'login').rejects({});

    return cmdFn(mockClient, {arg: 'bad', directive: CMD})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(530);
    });
  });

  it('bad // unsuccessful', () => {
    delete mockClient.username;
    return cmdFn(mockClient, {arg: 'bad', directive: CMD})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(503);
    });
  });
});
