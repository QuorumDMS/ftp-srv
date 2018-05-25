process.once('message', (initMsg, server) => {
  if (initMsg !== 'server') {
    return process.exit(-1);
  }

  process.on('message', (msg, ...args) => {

  });

  processQueues(server);
});

async function processQueues(server) {
  process.send('processQueues');
  const iterable = server.connectionManager.iterate();
  process.send('interable');
  for (const [id, client] of iterable) {
    process.send('process', id);
  }

  process.send('/processQueues');
  return processQueues(server);
}
