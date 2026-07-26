const https = require('https');
const data = require('./client/src/data/gallery.json');

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD' }, (res) => {
      resolve(res.statusCode);
    }).on('error', () => resolve('error')).end();
  });
}

(async () => {
  for (const d of data) {
    if (d.dayImageUrl) {
      const s = await checkUrl(d.dayImageUrl);
      if (s !== 200 && s !== 302) console.log(`FAIL ${s}: ${d.dayImageUrl}`);
    }
    if (d.nightImageUrl) {
      const s = await checkUrl(d.nightImageUrl);
      if (s !== 200 && s !== 302) console.log(`FAIL ${s}: ${d.nightImageUrl}`);
    }
  }
})();
