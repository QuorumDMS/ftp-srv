/* eslint no-unused-expressions: 0 */
const {expect} = require('chai');
const sinon = require('sinon');
const bunyan = require('bunyan');
const when = require('when');
const fs = require('fs');

const FtpServer = require('../src');
const FtpClient = require('ftp');

before(() => require('dotenv').load());

describe('Integration', function () {
  this.timeout(4000);

  let client;
  let sandbox;
  let log = bunyan.createLogger({name: 'test-runner', level: 60});
  let server;

  let connection;

  before(() => {
    server = new FtpServer(process.env.FTP_URL, {
      log,
      pasv_range: process.env.PASV_RANGE,
      tls: {
        key: `${process.cwd()}/test/cert/server.key`,
        cert: `${process.cwd()}/test/cert/server.crt`,
        ca: `${process.cwd()}/test/cert/server.csr`
      },
      greeting: ['hello', 'world']
    });
    server.on('login', (data, resolve) => {
      connection = data.connection;
      resolve({root: process.cwd()});
    });

    return server.listen();
  });
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => {
    sandbox.restore();
  });
  after(() => {
    server.close();
  });

  function connectClient(options) {
    return when.promise((resolve, reject) => {
      client = new FtpClient();
      client.once('ready', () => resolve(client));
      client.once('error', err => reject(err));
      client.connect(options);
    })
    .then(instance => {
      client = instance;
    });
  }

  function closeClient() {
    return when.promise((resolve, reject) => {
      client.once('close', () => resolve());
      client.once('error', err => reject(err));
      client.logout(err => {
        expect(err).to.be.undefined;
      });
    });
  }

  function runFileSystemTests() {

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
        expect(data.length).to.be.above(1);
        done();
      });
    });

    it('LIST index.spec.js', done => {
      client.list('index.spec.js', (err, data) => {
        expect(err).to.not.exist;
        expect(data).to.be.an('array');
        expect(data.length).to.be.equal(1);
        done();
      });
    });

    it('STOR fail.txt', done => {
      sandbox.stub(connection.fs, 'write').callsFake(function () {
        const fsPath = './test/fail.txt';
        const stream = require('fs').createWriteStream(fsPath, {flags: 'w+'});
        stream.once('error', () => fs.unlinkSync(fsPath));
        setTimeout(() => stream.emit('error', new Error('STOR fail test'), 1));
        return stream;
      });
      const buffer = Buffer.from('test text file');
      client.put(buffer, 'fail.txt', err => {
        expect(err).to.exist;
        expect(fs.existsSync('./test/fail.txt')).to.equal(false);
        done();
      });
    });

    it('STOR tést.txt', done => {
      const buffer = Buffer.from('test text file');
      client.put(buffer, 'tést.txt', err => {
        expect(err).to.not.exist;
        expect(fs.existsSync('./test/tést.txt')).to.equal(true);
        fs.readFile('./test/tést.txt', (fserr, data) => {
          expect(fserr).to.not.exist;
          expect(data.toString()).to.equal('test text file');
          done();
        });
      });
    });

    it('APPE tést.txt', done => {
      const buffer = Buffer.from(', awesome!');
      client.append(buffer, 'tést.txt', err => {
        expect(err).to.not.exist;
        fs.readFile('./test/tést.txt', (fserr, data) => {
          expect(fserr).to.not.exist;
          expect(data.toString()).to.equal('test text file, awesome!');
          done();
        });
      });
    });

    it('RETR tést.txt', done => {
      client.get('tést.txt', (err, stream) => {
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

    it('RNFR tést.txt, RNTO awesome.txt', done => {
      client.rename('tést.txt', 'awesome.txt', err => {
        expect(err).to.not.exist;
        expect(fs.existsSync('./test/tést.txt')).to.equal(false);
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

    it('MKD témp', done => {
      if (fs.existsSync('./test/témp')) {
        fs.rmdirSync('./test/témp');
      }
      client.mkdir('témp', err => {
        expect(err).to.not.exist;
        expect(fs.existsSync('./test/témp')).to.equal(true);
        done();
      });
    });

    it('CWD témp', done => {
      client.cwd('témp', (err, data) => {
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

    it('RMD témp', done => {
      client.rmdir('témp', err => {
        expect(err).to.not.exist;
        expect(fs.existsSync('./test/témp')).to.equal(false);
        done();
      });
    });

    it('CDUP', done => {
      client.cdup(err => {
        expect(err).to.not.exist;
        done();
      });
    });
  }

  describe('#ASCII', function () {
    before(() => {
      return connectClient({
        host: server.url.hostname,
        port: server.url.port,
        user: 'test',
        password: 'test'
      });
    });

    after(() => closeClient(client));

    it('TYPE A', done => {
      client.ascii(err => {
        expect(err).to.not.exist;
        done();
      });
    });

    runFileSystemTests();
  });

  describe('#BINARY', function () {
    before(() => {
      return connectClient({
        host: server.url.hostname,
        port: server.url.port,
        user: 'test',
        password: 'test'
      });
    });

    after(() => closeClient(client));

    it('TYPE I', done => {
      client.binary(err => {
        expect(err).to.not.exist;
        done();
      });
    });

    runFileSystemTests();
  });

  describe('#SECURE', function () {
    before(() => {
      return connectClient({
        host: server.url.hostname,
        port: server.url.port,
        user: 'test',
        password: 'test',
        secure: true,
        secureOptions: {
          rejectUnauthorized: false,
          checkServerIdentity: () => undefined
        }
      });
    });

    after(() => closeClient());

    runFileSystemTests();
  });
});
