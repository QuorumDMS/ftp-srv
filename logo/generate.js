/*
Send Button by Bruno Bosse from the Noun Project
https://thenounproject.com/brunobosse/collection/basics/?i=1054386
*/

const fs = require('fs');
const htmlConvert = require('html-convert');

const convert = htmlConvert();
let ws = fs.createWriteStream('logo.png');
let rs = convert('logo/logo.html', {
  width: 350,
  height: 76
});

rs.pipe(ws);
ws.on('finish', () => process.exit());
