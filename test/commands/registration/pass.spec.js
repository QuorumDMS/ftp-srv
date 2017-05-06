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
    server: { options: { anonymous: false } },
    username: 'user'
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(mockClient, 'reply').resolves();
    sandbox.stub(mockClient, 'login').resolves();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('pass // successful', done => {
    cmdFn({log, command: {arg: 'pass', directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(230);
      expect(mockClient.login.args[0]).to.eql(['user', 'pass']);
      done();
    })
    .catch(done);
  });

  it('// successful (anonymous)', done => {
    mockClient.server.options.anonymous = true;
    mockClient.authenticated = true;
    cmdFn({log, command: {directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(230);
      expect(mockClient.login.callCount).to.equal(0);
      mockClient.server.options.anonymous = false;
      mockClient.authenticated = false;
      done();
    })
    .catch(done);
  });

  it('bad // unsuccessful', done => {
    mockClient.login.restore();
    sandbox.stub(mockClient, 'login').rejects('bad');

    cmdFn({log, command: {arg: 'bad', directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(530);
      done();
    })
    .catch(done);
  });

  it('bad // unsuccessful', done => {
    mockClient.login.restore();
    sandbox.stub(mockClient, 'login').rejects({});

    cmdFn({log, command: {arg: 'bad', directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(530);
      done();
    })
    .catch(done);
  });

  it('bad // unsuccessful', done => {
    delete mockClient.username;
    cmdFn({log, command: {arg: 'bad', directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(503);
      done();
    })
    .catch(done);
  });
});
