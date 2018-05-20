const Promise = require('bluebird');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'USER';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => Promise.resolve(),
    server: {options: {}},
    login: () => Promise.resolve()
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    delete mockClient.username;
    mockClient.server.options = {};

    sandbox.spy(mockClient, 'reply');
    sandbox.spy(mockClient, 'login');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('test // successful | prompt for password', () => {
    return cmdFn(mockClient, {arg: 'test'})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(331);
    });
  });

  it('test // successful | anonymous login', () => {
    mockClient.server.options = {anonymous: true};

    return cmdFn(mockClient, {arg: 'anonymous'})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(230);
      expect(mockClient.login.callCount).to.equal(1);
    });
  });

  it('test // unsuccessful | no username provided', () => {
    return cmdFn(mockClient, { })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(501);
      expect(mockClient.login.callCount).to.equal(0);
    });
  });

  it('test // unsuccessful | already set username', () => {
    mockClient.username = 'test';

    return cmdFn(mockClient, {arg: 'test'})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(530);
      expect(mockClient.login.callCount).to.equal(0);
    });
  });

  it('test // successful | regular login if anonymous is true', () => {
    mockClient.server.options = {anonymous: true};

    return cmdFn(mockClient, {arg: 'test'})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(331);
      expect(mockClient.login.callCount).to.equal(0);
    });
  });

  it('test // successful | anonymous login with set username', () => {
    mockClient.server.options = {anonymous: 'sillyrabbit'};

    return cmdFn(mockClient, {arg: 'sillyrabbit'})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(230);
      expect(mockClient.login.callCount).to.equal(1);
    });
  });

  it('test // unsuccessful | anonymous login fails', () => {
    mockClient.server.options = {anonymous: true};
    mockClient.login.restore();
    sandbox.stub(mockClient, 'login').rejects(new Error('test'));

    return cmdFn(mockClient, {arg: 'anonymous'})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(530);
      expect(mockClient.login.callCount).to.equal(1);
    });
  });

  it('test // successful | does not login if already authenticated', () => {
    mockClient.authenticated = true;

    return cmdFn(mockClient, {arg: 'sillyrabbit'})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(230);
      expect(mockClient.login.callCount).to.equal(0);
    });
  });
});
