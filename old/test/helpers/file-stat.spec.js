const {expect} = require('chai');
const sinon = require('sinon');
const moment = require('moment');

const fileStat = require('../../src/helpers/file-stat');
const errors = require('../../src/errors');

describe('helpers // file-stat', function () {
  let sandbox;

  before(function () {
    sandbox = sinon.sandbox.create().usingPromise(Promise);
  });
  afterEach(function () {
    sandbox.restore();
  });

  const STAT = {
    name: 'test1',
    dev: 2114,
    ino: 48064969,
    mode: 33279,
    nlink: 1,
    uid: 85,
    gid: 100,
    rdev: 0,
    size: 527,
    blksize: 4096,
    blocks: 8,
    atime: 'Mon, 10 Oct 2017 23:24:11 GMT',
    mtime: 'Mon, 10 Oct 2017 23:24:11 GMT',
    ctime: 'Mon, 10 Oct 2017 23:24:11 GMT',
    birthtime: 'Mon, 10 Oct 2017 23:24:11 GMT',
    isDirectory: () => false
  };

  const STAT_OLD = {
    name: 'test2',
    dev: 2114,
    ino: 48064969,
    mode: 33279,
    nlink: 1,
    uid: 84,
    gid: 101,
    rdev: 0,
    size: 530,
    blksize: 4096,
    blocks: 8,
    atime: 'Mon, 10 Oct 2011 14:05:12 GMT',
    mtime: 'Mon, 10 Oct 2011 14:05:12 GMT',
    ctime: 'Mon, 10 Oct 2011 14:05:12 GMT',
    birthtime: 'Mon, 10 Oct 2011 14:05:12 GMT',
    isDirectory: () => false
  };

  describe('format - ls //', function () {
    it('formats correctly', () => {
      const momentStub = sandbox.stub(moment, 'utc').callThrough();
      momentStub.onFirstCall().callsFake(function () {
        return moment.utc(new Date('Sept 10 2016'));
      });

      const format = fileStat(STAT, 'ls');
      expect(format).to.equal('-rwxrwxrwx 1 85 100          527 Oct 10 23:24 test1');
    });

    it('formats correctly for files over 6 months old', () => {
      const format = fileStat(STAT_OLD, 'ls');
      expect(format).to.equal('-rwxrwxrwx 1 84 101          530 Oct 10  2011 test2');
    });

    it('formats without some attributes', () => {
      const format = fileStat({
        name: 'missing stuff',
        mtime: 'Mon, 10 Oct 2011 14:05:12 GMT',
        isDirectory: () => true
      }, 'ls');
      expect(format).to.equal('drwxr-xr-x 1 1 1              Oct 10  2011 missing stuff');
    });
  });

  describe('format - ep //', function () {
    it('formats correctly', () => {
      const format = fileStat(STAT, 'ep');
      expect(format).to.equal('+i842.2dd69c9,s527,m1507677851,up777,r	test1');
    });
  });

  describe('format - custom //', function () {
    it('fails on unknown format string', () => {
      const format = fileStat.bind(this, STAT, 'bad');
      expect(format).to.throw(errors.FileSystemError);
    });

    it('formats correctly', () => {
      function customerFormater(stat) {
        return [stat.gid, stat.name, stat.size].join('\t');
      }
      const format = fileStat(STAT, customerFormater);
      expect(format).to.equal('100\ttest1\t527');
    });
  });
});
