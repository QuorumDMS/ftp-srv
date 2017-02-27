const when = require('when');
const bunyan = require('bunyan');
const {expect} = require('chai');
const sinon = require('sinon');
require('sinon-as-promised');

const CMD = 'QUIT';
describe(CMD, done => {
  let sandbox;
  let log = bunyan.createLogger({name: CMD});
  const mockClient = {
    close: () => {}
  };
  const CMDFN = require(`../../src/commands/${CMD.toLowerCase()}`).bind(mockClient);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(mockClient, 'close').resolves();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('// successful', done => {
    CMDFN()
    .then(() => {
      expect(mockClient.close.callCount).to.equal(1);
      done();
    })
    .catch(done);
  });
});
