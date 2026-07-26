const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'client', 'public', 'games');

const requiredFiles = {
  "monument-2.jpg": "https://loremflickr.com/600/400/qutbminar",
  "monument-3.jpg": "https://loremflickr.com/600/400/hawamahal",
  "monument-4.jpg": "https://loremflickr.com/600/400/goldentemple,amritsar",
  "monument-5.jpg": "https://loremflickr.com/600/400/charminar",
  "monument-7.jpg": "https://loremflickr.com/600/400/indiagate",
  "monument-8.jpg": "https://loremflickr.com/600/400/hampi,temple"
};

for (const [filename, url] of Object.entries(requiredFiles)) {
  const dest = path.join(gamesDir, filename);
  try {
    console.log(`Downloading fallback for ${filename}...`);
    execSync(`curl -sL "${url}" -o "${dest}"`);
  } catch(e) {
    console.log(`Error on ${filename}`);
  }
}
console.log('DONE DOWNLOADING MONUMENT FALLBACKS');
