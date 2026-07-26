const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const galleryDir = path.join(__dirname, 'client', 'public', 'gallery');

const terms = {
  "gal-001-day": "Taj_Mahal",
  "gal-001-night": "Taj_Mahal", // patched later
  "gal-002-day": "Amer_Fort",
  "gal-002-night": "Amer_Fort", // patched later
  "gal-003-day": "Mysore_Palace",
  "gal-003-night": "Mysore_Palace", // patched later
  "gal-004-day": "Group_of_Monuments_at_Hampi",
  "gal-005-day": "Valley_of_Flowers_National_Park",
  "gal-006-day": "Dal_Lake",
  "gal-007-day": "Munnar",
  "gal-008-day": "Bengal_tiger",
  "gal-009-day": "Periyar_National_Park",
  "gal-010-day": "Hyderabadi_biryani",
  "gal-011-day": "Chole_bhature",
  "gal-012-day": "Sadya",
  "gal-013-day": "Holi",
  "gal-014-day": "Diwali",
  "gal-015-day": "Durga_Puja"
};

const nightPatches = {
  "gal-001-night": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Taj_Mahal_in_March_2004.jpg/800px-Taj_Mahal_in_March_2004.jpg",
  "gal-002-night": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Amber_Fort_at_night.jpg/800px-Amber_Fort_at_night.jpg",
  "gal-003-night": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Mysore_Palace_Illuminated_Dussehra.jpg/800px-Mysore_Palace_Illuminated_Dussehra.jpg"
};

for (const [id, title] of Object.entries(terms)) {
  const dest = path.join(galleryDir, `${id}.jpg`);
  if (nightPatches[id]) {
    try {
      execSync(`curl -sL -A "Mozilla/5.0" "${nightPatches[id]}" -o "${dest}"`);
      console.log(`Downloaded ${id} (patch)`);
    } catch(e) {}
    continue;
  }

  try {
    const apiRes = execSync(`curl -sL -A "Mozilla/5.0" "https://en.wikipedia.org/w/api.php?action=query&titles=${title}&prop=pageimages&format=json&pithumbsize=800"`).toString();
    const parsed = JSON.parse(apiRes);
    const pages = parsed.query.pages;
    const pageId = Object.keys(pages)[0];
    const thumbUrl = pages[pageId].thumbnail?.source;
    if (thumbUrl) {
      execSync(`curl -sL -A "Mozilla/5.0" "${thumbUrl}" -o "${dest}"`);
      console.log(`Downloaded ${id}`);
    } else {
      console.log(`No thumb for ${id}`);
      // Fallback to placeholder if wikipedia fails
      execSync(`curl -sL "https://placehold.co/800x600/1a1825/FF6B2B.jpg?text=${title.replace(/_/g, '+')}" -o "${dest}"`);
    }
  } catch (e) {
    console.log(`Failed ${id}`);
  }
}
