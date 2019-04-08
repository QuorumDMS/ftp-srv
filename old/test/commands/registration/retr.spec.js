const Promise = require('bluebird');
const bunyan = require('bunyan');
const {expect} = require('chai');
const sinon = require('sinon');
const EventEmitter = require('events');

const CMD = 'RETR';
describe(CMD, function () {
  let sandbox;
  let log = bunyan.createLogger({name: CMD});
  let emitter;
  const mockClient = {
    commandSocket: {
      pause: () => {},
      resume: () => {}
    },
    reply: () => Promise.resolve(),
    connector: {
      waitForConnection: () => Promise.resolve({
        resume: () => {}
      }),
      end: () => Promise.resolve({})
    }
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create().usingPromise(Promise);

    mockClient.fs = {
      read: () => {}
    };

    emitter = new EventEmitter();
    mockClient.emit = emitter.emit.bind(emitter);
    mockClient.on = emitter.on.bind(emitter);
    mockClient.once = emitter.once.bind(emitter);

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
      return Promise.reject(new Promise.TimeoutError());
    });


    return cmdFn({log, command: {arg: 'test.txt'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(425);
    });
  });

  it('// unsuccessful | connector errors out', () => {
    sandbox.stub(mockClient.connector, 'waitForConnection').callsFake(function () {
      return Promise.reject(new Error('test'));
    });

    return cmdFn({log, command: {arg: 'test.txt'}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(551);
    });
  });

  it('// unsuccessful | emits error event', () => {
    sandbox.stub(mockClient.connector, 'waitForConnection').callsFake(function () {
      return Promise.reject(new Error('test'));
    });

    let errorEmitted = false;
    emitter.once('RETR', (err) => {
      errorEmitted = !!err;
    });

    return cmdFn({log, command: {arg: 'test.txt'}})
    .then(() => {
      expect(errorEmitted).to.equal(true);
    });
  });
});
