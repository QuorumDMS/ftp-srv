const when = require('when');
const bunyan = require('bunyan');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'RETR';
describe(CMD, function () {
  let sandbox;
  let log = bunyan.createLogger({name: CMD});
  const mockClient = {
    commandSocket: {
      pause: () => {},
      resume: () => {}
    },
    reply: () => when.resolve(),
    connector: {
      waitForConnection: () => when.resolve({
        resume: () => {}
      }),
      end: () => {}
    }
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    mockClient.fs = {
      read: () => {}
    };

    sandbox.spy(mockClient, 'reply');
  });
  afterEach(() => sandbox.restore());

  it('// unsuccessful | no file system', () => {
    delete mockClient.fs;

    return cmdFn()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(550);
    });
  });

  it('// unsuccessful | file system does not have functions', () => {
    mockClient.fs = {};

    return cmdFn()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(402);
    });
  });

  it('// unsuccessful | connector times out', () => {
    sandbox.stub(mockClient.connector, 'waitForConnection').callsFake(function () {
      return when.reject(new when.TimeoutError());
    });

    return cmdFn({log, command: {arg: 'test.txt'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(425);
    });
  });

  it('// unsuccessful | connector errors out', () => {
    sandbox.stub(mockClient.connector, 'waitForConnection').callsFake(function () {
      return when.reject(new Error('test'));
    });

    return cmdFn({log, command: {arg: 'test.txt'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(551);
    });
  });
});
