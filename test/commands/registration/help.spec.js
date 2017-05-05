const when = require('when');
const {expect} = require('chai');
const sinon = require('sinon');

const CMD = 'HELP';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => when.resolve()
  };
  const cmdFn = require(`../../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.spy(mockClient, 'reply');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// successful', done => {
    cmdFn({command: { directive: CMD }})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(211);
      done();
    })
    .catch(done);
  });

  it('help // successful', done => {
    cmdFn({command: { arg: 'help', directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(214);
      done();
    })
    .catch(done);
  });

  it('help // successful', done => {
    cmdFn({command: { arg: 'allo', directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(214);
      done();
    })
    .catch(done);
  });

  it('bad // unsuccessful', done => {
    cmdFn({command: { arg: 'bad', directive: CMD}})
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(502);
      done();
    })
    .catch(done);
  });
});
