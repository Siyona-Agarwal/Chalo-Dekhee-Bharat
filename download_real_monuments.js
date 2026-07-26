const fs = require('fs');
const https = require('https');
const path = require('path');

const wikiMap = {
  1: "Taj_Mahal",
  2: "Qutb_Minar",
  3: "Hawa_Mahal",
  4: "Golden_Temple",
  5: "Charminar",
  6: "Gateway_of_India",
  7: "India_Gate",
  8: "Virupaksha_Temple,_Hampi"
};

async function getWikiThumb(title) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=600`;
    https.get(url, { headers: { 'User-Agent': 'ChaloDekheBharat/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const pages = parsed.query.pages;
          const pageId = Object.keys(pages)[0];
          resolve(pages[pageId].thumbnail?.source || null);
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'ChaloDekheBharat/1.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

(async () => {
  const destDir = path.join(__dirname, 'client', 'public', 'games');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  for (let i = 1; i <= 8; i++) {
    const title = wikiMap[i];
    console.log(`Fetching ${title}...`);
    const thumbUrl = await getWikiThumb(title);
    if (thumbUrl) {
      console.log(`Downloading ${thumbUrl}...`);
      const destPath = path.join(destDir, `monument-${i}.jpg`);
      await downloadImage(thumbUrl, destPath).catch(console.error);
    } else {
      console.log(`Could not find thumb for ${title}`);
    }
  }
  console.log('DONE');
})();
