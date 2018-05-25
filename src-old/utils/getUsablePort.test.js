const {getUsablePort} = require('./getUsablePort');

test('expects an available port to be found', async () => {
  const port = await getUsablePort();
  expect(port).toBeGreaterThan(0);
});