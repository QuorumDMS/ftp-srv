const when = require('when');
const {expect} = require('chai');
const sinon = require('sinon');

const ActiveConnector = require('../../src/connector/active');

const CMD = 'PORT';
describe(CMD, function () {
  let sandbox;
  const mockClient = {
    reply: () => when.resolve()
  };
  const cmdFn = require(`../../src/commands/registration/${CMD.toLowerCase()}`).handler.bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.spy(mockClient, 'reply');
    sandbox.stub(ActiveConnector.prototype, 'setupConnection').resolves();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// unsuccessful | no argument', done => {
    cmdFn()
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(425);
      done();
    })
    .catch(done);
  });

  it('// unsuccessful | invalid argument', done => {
    cmdFn({ command: { _: [CMD, '1,2,3,4,5'] } })
    .then(() => {
      expect(mockClient.reply.args[0][0]).to.equal(425);
      done();
    })
    .catch(done);
  });

  it('// successful', done => {
    cmdFn({ command: { _: [CMD, '192,168,0,100,137,214'] } })
    .then(() => {
      const [ip, port] = ActiveConnector.prototype.setupConnection.args[0];
      expect(mockClient.reply.args[0][0]).to.equal(200);
      expect(ip).to.equal('192.168.0.100');
      expect(port).to.equal(35286);
      done();
    })
    .catch(done);
  });
});
