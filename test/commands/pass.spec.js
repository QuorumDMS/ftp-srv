const when = require('when');
const bunyan = require('bunyan');
const {expect} = require('chai');
const sinon = require('sinon');
require('sinon-as-promised');

const CMD = 'PASS';
describe(CMD, done => {
  let sandbox;
  let log = bunyan.createLogger({name: CMD});
  const mockClient = {
    reply: () => {},
    login: () => {},
    server: { options: { anonymous: false } },
    username: 'user'
  };
  const CMDFN = require(`../../src/commands/${CMD.toLowerCase()}`).bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(mockClient, 'reply').resolves();
    sandbox.stub(mockClient, 'login').resolves();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('pass // successful', done => {
    CMDFN({log, command: {_: [CMD, 'pass'], directive: CMD}})
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
    CMDFN({log, command: {_: [CMD], directive: CMD}})
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

    CMDFN({log, command: {_: [CMD, 'bad'], directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(530);
      done();
    })
    .catch(done);
  });

  it('bad // unsuccessful', done => {
    mockClient.login.restore();
    sandbox.stub(mockClient, 'login').rejects({})

    CMDFN({log, command: {_: [CMD, 'bad'], directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(530);
      done();
    })
    .catch(done);
  });

  it('bad // unsuccessful', done => {
    delete mockClient.username;
    CMDFN({log, command: {_: [CMD, 'bad'], directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(503);
      done();
    })
    .catch(done);
  });
});
