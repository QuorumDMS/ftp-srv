const fs = require('fs');
const htmlConvert = require('html-convert');

const convert = htmlConvert();
let ws = fs.createWriteStream('logo.png');
let rs = convert('./logo.html', {
  width: 350,
  height: 90
});

rs.pipe(ws);
ws.on('finish', () => process.exit());
