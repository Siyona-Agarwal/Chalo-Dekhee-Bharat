const fs = require('fs');
const https = require('https');
const path = require('path');

const galleryDir = path.join(__dirname, 'client', 'public', 'gallery');
if (!fs.existsSync(galleryDir)) {
  fs.mkdirSync(galleryDir, { recursive: true });
}

const requiredFiles = {
  "gal-001-day.jpg": "https://loremflickr.com/800/600/tajmahal",
  "gal-001-night.jpg": "https://loremflickr.com/800/600/tajmahal,night",
  "gal-002-day.jpg": "https://loremflickr.com/800/600/amberfort",
  "gal-002-night.jpg": "https://loremflickr.com/800/600/amberfort,night",
  "gal-003-day.jpg": "https://loremflickr.com/800/600/mysorepalace",
  "gal-003-night.jpg": "https://loremflickr.com/800/600/mysorepalace,night",
  "gal-004-day.jpg": "https://loremflickr.com/800/600/hampiruins",
  "gal-005-day.jpg": "https://loremflickr.com/800/600/himalayas,valley",
  "gal-006-day.jpg": "https://loremflickr.com/800/600/dallake",
  "gal-007-day.jpg": "https://loremflickr.com/800/600/munnar,tea",
  "gal-008-day.jpg": "https://loremflickr.com/800/600/bengaltiger",
  "gal-009-day.jpg": "https://loremflickr.com/800/600/elephant,india",
  "gal-010-day.jpg": "https://loremflickr.com/800/600/biryani",
  "gal-011-day.jpg": "https://loremflickr.com/800/600/streetfood,india",
  "gal-012-day.jpg": "https://loremflickr.com/800/600/thali,food",
  "gal-013-day.jpg": "https://loremflickr.com/800/600/holi,festival",
  "gal-014-day.jpg": "https://loremflickr.com/800/600/diwali,lamps",
  "gal-015-day.jpg": "https://loremflickr.com/800/600/durgapuja"
};

function downloadImage(url, dest) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, dest).then(resolve);
      }
      if (res.statusCode !== 200) {
        console.log(`Failed ${res.statusCode} for ${url}`);
        return resolve(false);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', () => resolve(false));
  });
}

(async () => {
  for (const [filename, url] of Object.entries(requiredFiles)) {
    const dest = path.join(galleryDir, filename);
    const stats = fs.existsSync(dest) ? fs.statSync(dest) : null;
    
    // Only download if it doesn't exist or is tiny (like a 2008 byte error page)
    if (!stats || stats.size < 5000) {
      console.log(`Downloading missing/broken ${filename}...`);
      await downloadImage(url, dest);
    } else {
      console.log(`Already have ${filename} (${stats.size} bytes)`);
    }
  }

  // Rewrite gallery.json to point locally
  const galleryPath = path.join(__dirname, 'client', 'src', 'data', 'gallery.json');
  const galleryData = JSON.parse(fs.readFileSync(galleryPath, 'utf8'));
  
  for (const item of galleryData) {
    item.imageUrl = `/gallery/${item.id}-day.jpg`;
    item.dayImageUrl = `/gallery/${item.id}-day.jpg`;
    if (item.id === "gal-001" || item.id === "gal-002" || item.id === "gal-003") {
      item.hasDayNight = true;
      item.nightImageUrl = `/gallery/${item.id}-night.jpg`;
    } else {
      item.hasDayNight = false;
      item.nightImageUrl = null;
    }
  }
  
  fs.writeFileSync(galleryPath, JSON.stringify(galleryData, null, 2));
  console.log('ALL IMAGES SYNCED LOCALLY AND GALLERY.JSON UPDATED!');
})();
