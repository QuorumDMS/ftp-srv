const puppeteer = require('puppeteer');

(async function () {
  const logoPath = `file://${process.cwd()}/logo/logo.html`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(logoPath);
  await page.setViewport({
    width: 600,
    height: 250,
    deviceScaleFactor: 2
  });
  await page.screenshot({
    path: 'logo.png',
    omitBackground: true
  });
  await browser.close();
})();
