const when = require('when');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'USER';
describe(CMD, function () {
  let sandbox;
  const mockLog = {
    error: () => {}
  };
  const mockClient = {
    reply: () => when.resolve(),
    server: { options: {} },
    login: () => when.resolve()
  };
  const cmdFn = require(`../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

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

  it('test // successful | prompt for password', done => {
    cmdFn({ command: { _: [CMD, 'test'] } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(331);
      done();
    })
    .catch(done);
  });

  it('test // successful | anonymous login', done => {
    mockClient.server.options = {anonymous: true};

    cmdFn({ command: { _: [CMD, 'test'] } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(230);
      expect(mockClient.login.callCount).to.equal(1);
      done();
    })
    .catch(done);
  });

  it('test // unsuccessful | no username provided', done => {
    cmdFn({ command: { _: [CMD] } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(501);
      expect(mockClient.login.callCount).to.equal(0);
      done();
    })
    .catch(done);
  });

  it('test // unsuccessful | already set username', done => {
    mockClient.username = 'test';

    cmdFn({ command: { _: [CMD, 'test'] } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(530);
      expect(mockClient.login.callCount).to.equal(0);
      done();
    })
    .catch(done);
  });

  it('test // unsuccessful | login function rejects', done => {
    mockClient.server.options = {anonymous: true};

    mockClient.login.restore();
    sandbox.stub(mockClient, 'login').rejects(new Error('test'));

    cmdFn({ log: mockLog, command: { _: [CMD, 'test'] } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(530);
      expect(mockClient.login.callCount).to.equal(1);
      done();
    })
    .catch(done);
  });
});
