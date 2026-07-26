const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const galleryDir = path.join(__dirname, 'client', 'public', 'gallery');

const requiredFiles = {
  "gal-001-night.jpg": "https://loremflickr.com/800/600/tajmahal,night",
  "gal-002-night.jpg": "https://loremflickr.com/800/600/amberfort,night",
  "gal-003-night.jpg": "https://loremflickr.com/800/600/mysorepalace,night",
  "gal-004-day.jpg": "https://loremflickr.com/800/600/hampiruins",
  "gal-011-day.jpg": "https://loremflickr.com/800/600/streetfood,india",
  "gal-012-day.jpg": "https://loremflickr.com/800/600/thali,food",
  "gal-013-day.jpg": "https://loremflickr.com/800/600/holi,festival",
  "gal-014-day.jpg": "https://loremflickr.com/800/600/diwali,lamps",
  "gal-015-day.jpg": "https://loremflickr.com/800/600/durgapuja"
};

for (const [filename, url] of Object.entries(requiredFiles)) {
  const dest = path.join(galleryDir, filename);
  try {
    console.log(`Downloading ${filename} via curl...`);
    execSync(`curl -sL "${url}" -o "${dest}"`);
  } catch(e) {
    console.log(`Error on ${filename}`);
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
console.log('DONE!');
