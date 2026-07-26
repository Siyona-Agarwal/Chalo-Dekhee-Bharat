const fs = require('fs');
const https = require('https');
const path = require('path');

const galleryDir = path.join(__dirname, 'client', 'public', 'gallery');
if (!fs.existsSync(galleryDir)) {
  fs.mkdirSync(galleryDir, { recursive: true });
}

const imagesToDownload = [
  { name: 'gal-001-day.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Taj_Mahal_(Edited).jpeg?width=800' },
  { name: 'gal-001-night.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Taj_Mahal_in_March_2004.jpg?width=800' },
  { name: 'gal-002-day.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Amber_Fort_Jaipur.jpg?width=800' },
  { name: 'gal-002-night.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Amber_Fort_at_night.jpg?width=800' },
  { name: 'gal-003-day.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mysore_Palace_Morning.jpg?width=800' },
  { name: 'gal-003-night.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mysore_Palace_Illuminated_Dussehra.jpg?width=800' },
  { name: 'gal-004-day.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Wide_angle_of_Galigopuram_of_Virupaksha_Temple,_Hampi_(04)_(cropped).jpg?width=800' },
  { name: 'gal-005-day.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Valley_of_flowers_national_park,_Uttarakhand,_India_03_(edit).jpg?width=800' },
  { name: 'gal-006-day.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dal_Lake_Hazratbal_Srinagar.jpg?width=800' },
  { name: 'gal-007-day.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Munnar_Overview.jpg?width=800' },
  { name: 'gal-008-day.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bengal_tiger_in_Sanjay_Dubri_Tiger_Reserve_December_2024_by_Tisha_Mukherjee_11.jpg?width=800' },
  { name: 'gal-009-day.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Periyar_National_Park.JPG?width=800' },
  { name: 'gal-010-day.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hyderabadi_Chicken_Biryani.jpg?width=800' },
  { name: 'gal-011-day.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chole_bhature_by_a_street_vendor_in_Delhi.jpg?width=800' },
  { name: 'gal-012-day.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sadya_for_Onam.jpg?width=800' },
  { name: 'gal-013-day.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Holi_Festival_of_Colors.jpg?width=800' },
  { name: 'gal-014-day.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Diwali_lamps.jpg?width=800' },
  { name: 'gal-015-day.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Durga_Puja_Kolkata_2019.jpg?width=800' }
];

function downloadImage(url, dest) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'ChaloDekheBharat/1.0' } }, (res) => {
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
    }).on('error', (err) => {
      console.log(`Error downloading ${url}:`, err.message);
      resolve(false);
    });
  });
}

(async () => {
  for (const img of imagesToDownload) {
    const dest = path.join(galleryDir, img.name);
    console.log(`Downloading ${img.name}...`);
    await downloadImage(img.url, dest);
  }
  
  // Update gallery.json to point to local files
  const galleryPath = path.join(__dirname, 'client', 'src', 'data', 'gallery.json');
  const galleryData = JSON.parse(fs.readFileSync(galleryPath, 'utf8'));
  
  for (const item of galleryData) {
    item.imageUrl = `/gallery/${item.id}-day.jpg`;
    item.dayImageUrl = `/gallery/${item.id}-day.jpg`;
    if (item.hasDayNight) {
      item.nightImageUrl = `/gallery/${item.id}-night.jpg`;
    } else {
      item.nightImageUrl = null;
    }
  }
  
  fs.writeFileSync(galleryPath, JSON.stringify(galleryData, null, 2));
  console.log('Finished downloading all images and updating gallery.json!');
})();
