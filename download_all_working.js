const fs = require('fs');
const https = require('https');
const path = require('path');

const galleryDir = path.join(__dirname, 'client', 'public', 'gallery');
if (!fs.existsSync(galleryDir)) {
  fs.mkdirSync(galleryDir, { recursive: true });
}

// Map gal-id to a broad search term that is guaranteed to return a page with an image
const searchTerms = {
  "gal-001": "Taj Mahal",
  "gal-002": "Amer Fort",
  "gal-003": "Mysore Palace",
  "gal-004": "Hampi",
  "gal-005": "Valley of Flowers National Park",
  "gal-006": "Dal Lake",
  "gal-007": "Munnar",
  "gal-008": "Bengal tiger",
  "gal-009": "Periyar National Park",
  "gal-010": "Biryani",
  "gal-011": "Street food of Chennai",
  "gal-012": "Sadya",
  "gal-013": "Holi",
  "gal-014": "Diwali",
  "gal-015": "Durga Puja"
};

function getWikiThumbUrl(title) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=800`;
    https.get(url, { headers: { 'User-Agent': 'ChaloDekheBharat/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const pages = JSON.parse(data).query.pages;
          const pageId = Object.keys(pages)[0];
          resolve(pages[pageId].thumbnail ? pages[pageId].thumbnail.source : null);
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'ChaloDekheBharat/1.0' } }, (res) => {
      if (res.statusCode !== 200) return resolve(false);
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
    }).on('error', () => resolve(false));
  });
}

(async () => {
  const gallery = JSON.parse(fs.readFileSync('client/src/data/gallery.json', 'utf8'));
  
  for (const item of gallery) {
    const term = searchTerms[item.id];
    if (!term) continue;
    
    console.log(`Resolving ${term}...`);
    const thumbUrl = await getWikiThumbUrl(term);
    if (!thumbUrl) {
       console.log(`No thumb for ${term}`);
       continue;
    }
    
    const dest = path.join(galleryDir, `${item.id}-day.jpg`);
    console.log(`Downloading to ${item.id}-day.jpg...`);
    const success = await downloadImage(thumbUrl, dest);
    
    if (success) {
      item.imageUrl = `/gallery/${item.id}-day.jpg`;
      item.dayImageUrl = `/gallery/${item.id}-day.jpg`;
    }
  }

  // Hardcode night images from reliable urls
  const nightUrls = {
    "gal-001": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Taj_Mahal_in_March_2004.jpg/800px-Taj_Mahal_in_March_2004.jpg",
    "gal-002": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Amber_Fort_at_night.jpg/800px-Amber_Fort_at_night.jpg",
    "gal-003": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Mysore_Palace_Illuminated_Dussehra.jpg/800px-Mysore_Palace_Illuminated_Dussehra.jpg"
  };
  
  for (const [id, url] of Object.entries(nightUrls)) {
    const item = gallery.find(g => g.id === id);
    if (item) {
      const dest = path.join(galleryDir, `${id}-night.jpg`);
      const success = await downloadImage(url, dest);
      if (success) item.nightImageUrl = `/gallery/${id}-night.jpg`;
    }
  }

  fs.writeFileSync('client/src/data/gallery.json', JSON.stringify(gallery, null, 2));
  console.log('DONE DOWNLOADING ALL!');
})();
