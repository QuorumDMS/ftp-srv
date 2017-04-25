/* eslint no-unused-expressions: 0 */
require('dotenv').load();
const {expect} = require('chai');
const bunyan = require('bunyan');
const fs = require('fs');

const FtpServer = require('../src');
const FtpClient = require('ftp');

describe('FtpServer', function () {
  this.timeout(2000);
  let log = bunyan.createLogger({name: 'test', level: 10});
  let server;
  let client;

  before(done => {
    server = new FtpServer(process.env.FTP_URL, {
      log,
      pasv_range: process.env.PASV_RANGE
    });
    server.on('login', (data, resolve) => {
      resolve({root: process.cwd()});
    });
    process.on('SIGINT', function () {
      server.close();
    });

    require('child_process').exec(`sudo kill $(sudo lsof -t -i:${server.url.port})`, () => {
      server.listen()
      .finally(() => done());
    });
  });
  after(() => {
    server.close();
  });

  it('accepts client connection', done => {
    expect(server).to.exist;
    client = new FtpClient();
    client.once('ready', () => done());
    client.connect({
      host: server.url.hostname,
      port: server.url.port,
      user: 'test',
      password: 'test'
    });
  });

  it('STAT', done => {
    client.status((err, status) => {
      expect(err).to.not.exist;
      expect(status).to.be.a('string');
      done();
    });
  });

  it('SYST', done => {
    client.system((err, os) => {
      expect(err).to.not.exist;
      expect(os).to.be.a('string');
      done();
    });
  });

  it('CWD ..', done => {
    const dir = '..';
    client.cwd(`${dir}`, (err, data) => {
      expect(err).to.not.exist;
      expect(data).to.be.a('string');
      done();
    });
  });

  it('CWD test', done => {
    const dir = 'test';
    client.cwd(`${dir}`, (err, data) => {
      expect(err).to.not.exist;
      expect(data).to.be.a('string');
      done();
    });
  });

  it('PWD', done => {
    client.pwd((err, data) => {
      expect(err).to.not.exist;
      expect(data).to.be.a('string');
      done();
    });
  });

  it('LIST .', done => {
    client.list('.', (err, data) => {
      expect(err).to.not.exist;
      expect(data).to.be.an('array');
      done();
    });
  });

  const runFileSystemTests = () => {
    it('STOR test.txt', done => {
      const buffer = Buffer.from('test text file');
      client.put(buffer, 'test.txt', err => {
        expect(err).to.not.exist;
        expect(fs.existsSync('./test/test.txt')).to.equal(true);
        fs.readFile('./test/test.txt', (fserr, data) => {
          expect(fserr).to.not.exist;
          expect(data.toString()).to.equal('test text file');
          done();
        });
      });
    });

    it('APPE test.txt', done => {
      const buffer = Buffer.from(', awesome!');
      client.append(buffer, 'test.txt', err => {
        expect(err).to.not.exist;
        fs.readFile('./test/test.txt', (fserr, data) => {
          expect(fserr).to.not.exist;
          expect(data.toString()).to.equal('test text file, awesome!');
          done();
        });
      });
    });

    it('RETR test.txt', done => {
      client.get('test.txt', (err, stream) => {
        expect(err).to.not.exist;
        let text = '';
        stream.on('data', data => {
          text += data.toString();
        });
        stream.on('end', () => {
          expect(text).to.equal('test text file, awesome!');
          done();
        });
      });
    });

    it('RNFR test.txt, RNTO awesome.txt', done => {
      client.rename('test.txt', 'awesome.txt', err => {
        expect(err).to.not.exist;
        expect(fs.existsSync('./test/test.txt')).to.equal(false);
        expect(fs.existsSync('./test/awesome.txt')).to.equal(true);
        fs.readFile('./test/awesome.txt', (fserr, data) => {
          expect(fserr).to.not.exist;
          expect(data.toString()).to.equal('test text file, awesome!');
          done();
        });
      });
    });

    it('SIZE awesome.txt', done => {
      client.size('awesome.txt', (err, size) => {
        expect(err).to.not.exist;
        expect(size).to.be.a('number');
        done();
      });
    });

    it('MDTM awesome.txt', done => {
      client.lastMod('awesome.txt', err => {
        expect(err).to.not.exist;
        done();
      });
    });

    it('SITE CHMOD 700 awesome.txt', done => {
      client.site('CHMOD 600 awesome.txt', err => {
        expect(err).to.not.exist;
        fs.stat('./test/awesome.txt', (fserr, stats) => {
          expect(fserr).to.not.exist;
          const mode = stats.mode.toString(8);
          expect(/600$/.test(mode)).to.equal(true);
          done();
        });
      });
    });

    it('DELE awesome.txt', done => {
      client.delete('awesome.txt', err => {
        expect(err).to.not.exist;
        expect(fs.existsSync('./test/awesome.txt')).to.equal(false);
        done();
      });
    });
  };

  it('TYPE A', done => {
    client.ascii(err => {
      expect(err).to.not.exist;
      done();
    });
  });
  runFileSystemTests();

  it('TYPE I', done => {
    client.binary(err => {
      expect(err).to.not.exist;
      done();
    });
  });
  runFileSystemTests();

  it('MKD tmp', done => {
    if (fs.existsSync('./test/tmp')) {
      fs.rmdirSync('./test/tmp');
    }
    client.mkdir('tmp', err => {
      expect(err).to.not.exist;
      expect(fs.existsSync('./test/tmp')).to.equal(true);
      done();
    });
  });

  it('CWD tmp', done => {
    client.cwd('tmp', (err, data) => {
      expect(err).to.not.exist;
      expect(data).to.be.a('string');
      done();
    });
  });

  it('CDUP', done => {
    client.cdup(err => {
      expect(err).to.not.exist;
      done();
    });
  });

  it('RMD tmp', done => {
    client.rmdir('tmp', err => {
      expect(err).to.not.exist;
      expect(fs.existsSync('./test/tmp')).to.equal(false);
      done();
    });
  });

  it('QUIT', done => {
    client.once('close', done)
    client.logout(err => {
      expect(err).to.be.undefined;
    });
  });
});
