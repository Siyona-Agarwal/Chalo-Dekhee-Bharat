const fs = require('fs');
const https = require('https');

const data = JSON.parse(fs.readFileSync('client/src/data/gallery.json', 'utf8'));
const urls = new Set();
data.forEach(d => {
  if (d.imageUrl) urls.add(d.imageUrl);
  if (d.dayImageUrl) urls.add(d.dayImageUrl);
  if (d.nightImageUrl) urls.add(d.nightImageUrl);
});

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD' }, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', () => resolve({ url, status: 'error' })).end();
  });
}

(async () => {
  for (const url of urls) {
    const res = await checkUrl(url);
    if (res.status !== 200) {
      console.log(`FAIL ${res.status}: ${url}`);
    }
  }
})();
