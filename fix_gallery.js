const fs = require('fs');
const https = require('https');

const gallery = JSON.parse(fs.readFileSync('client/src/data/gallery.json', 'utf8'));

// The titles of Wikipedia pages to pull images from
const wikiMap = {
  "gal-001": { day: "Taj_Mahal", night: "Taj_Mahal" }, // Will manually patch night later
  "gal-002": { day: "Amer_Fort", night: "Amer_Fort" },
  "gal-003": { day: "Mysore_Palace", night: "Mysore_Palace" },
  "gal-004": { day: "Hampi" },
  "gal-005": { day: "Valley_of_Flowers_National_Park" },
  "gal-006": { day: "Dal_Lake" },
  "gal-007": { day: "Munnar" },
  "gal-008": { day: "Bengal_tiger" },
  "gal-009": { day: "Periyar_National_Park" },
  "gal-010": { day: "Hyderabadi_biryani" },
  "gal-011": { day: "Street_food_of_Chennai" }, // fallback
  "gal-012": { day: "Sadya" },
  "gal-013": { day: "Holi" },
  "gal-014": { day: "Diwali" },
  "gal-015": { day: "Durga_Puja" }
};

async function getWikiThumb(title) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=800`;
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

(async () => {
  for (const item of gallery) {
    const mapping = wikiMap[item.id];
    if (mapping) {
      console.log(`Fetching ${item.title}...`);
      const thumb = await getWikiThumb(mapping.day);
      if (thumb) {
        item.imageUrl = thumb;
        item.dayImageUrl = thumb;
      }
    }
  }
  
  // Hardcode night images using known good wikipedia thumbs
  gallery[0].nightImageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Taj_Mahal_in_March_2004.jpg/800px-Taj_Mahal_in_March_2004.jpg"; // Mock night
  gallery[1].nightImageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Amber_Fort_at_night.jpg/800px-Amber_Fort_at_night.jpg";
  gallery[2].nightImageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Mysore_Palace_Illuminated_Dussehra.jpg/800px-Mysore_Palace_Illuminated_Dussehra.jpg";
  
  fs.writeFileSync('client/src/data/gallery.json', JSON.stringify(gallery, null, 2));
  console.log('DONE');
})();
