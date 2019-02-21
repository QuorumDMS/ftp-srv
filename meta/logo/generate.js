const puppeteer = require('puppeteer');
const logoPath = `file://${process.cwd()}/logo/logo.html`;

puppeteer.launch()
.then(browser => {
  return browser.newPage()
  .then(page => {
    return page.goto(logoPath)
    .then(() => page);
  })
  .then(page => {
    return page.setViewport({
      width: 600,
      height: 250,
      deviceScaleFactor: 2
    })
    .then(() => page.screenshot({
      path: 'logo.png',
      omitBackground: true
    }));
  })
  .then(() => browser.close());
});
