const {expect} = require('chai');
const dateFns = require('date-fns');

const fileStat = require('../../src/helpers/file-stat');
const errors = require('../../src/errors');

describe('helpers // file-stat', function () {
  const STAT = {
    name: 'test1',
    dev: 2114,
    ino: 48064969,
    mode: 33188,
    nlink: 1,
    uid: 85,
    gid: 100,
    rdev: 0,
    size: 527,
    blksize: 4096,
    blocks: 8,
    atime: 'Mon, 10 Oct 2011 23:24:11 GMT',
    mtime: 'Mon, 10 Oct 2011 23:24:11 GMT',
    ctime: 'Mon, 10 Oct 2011 23:24:11 GMT',
    birthtime: 'Mon, 10 Oct 2011 23:24:11 GMT',
    isDirectory: () => false
  };

  describe.skip('format - ls //', function () {
    it('formats correctly', () => {
      const format = fileStat(STAT, 'ls');
      expect(format).to.equal('-rwxrw-r-- 1 85 100          527 Oct 10 17:24 test1');
    });
  });

  describe.skip('format - ep //', function () {
    it('formats correctly', () => {
      const format = fileStat(STAT, 'ep');
      expect(format).to.equal('+i842.2dd69c9,s527,m1318289051,up644,/	test1');
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
