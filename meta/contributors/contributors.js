const {get} = require('https');

get('https://api.github.com/repos/trs/ftp-srv/contributors', {
  headers: {
    'User-Agent': 'Chrome'
  }
}, (res) => {
  let response = '';
  res.on('data', (data) => {
    response += data;
  });
  res.on('end', () => {
    const contributors = JSON.parse(response)
      .filter((contributor) => contributor.type === 'User');

    for (const contributor of contributors) {
      const url = contributor.html_url;
      const username = contributor.login;

      const markdown = `- [${username}](${url})\n`;

      process.stdout.write(markdown);
    }
  });
}).on('error', (err) => {
  process.stderr.write(err);
});