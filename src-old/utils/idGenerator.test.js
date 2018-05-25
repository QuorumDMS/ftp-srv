const {idGenerator} = require('./idGenerator');

test('expects ids to be generated', () => {
  const id = idGenerator(1);
  expect(id.next().value).toBe(1);
  expect(id.next().value).toBe(2);
  expect(id.next().value).toBe(3);
});
