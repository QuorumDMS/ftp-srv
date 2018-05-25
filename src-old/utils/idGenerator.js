function* idGenerator(start) {
  let i = start;
  while (true) yield i++;
}

module.exports = {idGenerator};
