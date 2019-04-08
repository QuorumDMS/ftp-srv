const Promise = require('bluebird');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'AUTH';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => Promise.resolve(),
    server: {
      options: {
        tls: {}
      }
    }
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create().usingPromise(Promise);

    sandbox.spy(mockClient, 'reply');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('TLS // supported', () => {
    return cmdFn({command: {arg: 'TLS', directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(234);
      expect(mockClient.secure).to.equal(true);
    });
  });

  it('SSL // not supported', () => {
    return cmdFn({command: {arg: 'SSL', directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(504);
    });
  });

  it('bad // bad', () => {
    return cmdFn({command: {arg: 'bad', directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(504);
    });
  });
});
