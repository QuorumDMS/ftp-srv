const net = require('net');

const Server = require('./Server');
const {getUsablePort} = require('./utils/getUsablePort');

let PORT;

beforeEach(async () => {
  PORT = await getUsablePort(8000);
});

test('expects server to start listening', done => {
  const server = new Server();
  server.once('listening', () => server.close());
  server.once('close', () => done());
  server.listen(PORT);
});

test('expects server to accept a client', done => {
  const server = new Server();
  server.once('client', client => {
    expect(client.id).toBeGreaterThan(0);
    server.close();
  });
  server.once('close', () => done());
  server.listen(PORT);

  net.createConnection(PORT);
});

test('expects server to send greeting on client connection', done => {
  const server = new Server();
  server.once('client', client => {
    expect(client.id).toBeGreaterThan(0);
  });
  server.once('close', () => done());
  server.listen(PORT);

  const connection = net.createConnection(PORT);
  connection.once('data', () => server.close());
});