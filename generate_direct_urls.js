const fs = require('fs');

const directUrls = {
  "gal-001": { 
    day: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/800px-Taj_Mahal_%28Edited%29.jpeg", 
    night: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Taj_Mahal_in_March_2004.jpg/800px-Taj_Mahal_in_March_2004.jpg" 
  },
  "gal-002": { 
    day: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Amber_Fort_Jaipur.jpg/800px-Amber_Fort_Jaipur.jpg", 
    night: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Amber_Fort_at_night.jpg/800px-Amber_Fort_at_night.jpg" 
  },
  "gal-003": { 
    day: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mysore_Palace_Morning.jpg/800px-Mysore_Palace_Morning.jpg", 
    night: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Mysore_Palace_Illuminated_Dussehra.jpg/800px-Mysore_Palace_Illuminated_Dussehra.jpg" 
  },
  "gal-004": { day: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg/800px-Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg" },
  "gal-005": { day: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Valley_of_flowers_national_park%2C_Uttarakhand%2C_India_03_%28edit%29.jpg/800px-Valley_of_flowers_national_park%2C_Uttarakhand%2C_India_03_%28edit%29.jpg" },
  "gal-006": { day: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Dal_Lake_Hazratbal_Srinagar.jpg/800px-Dal_Lake_Hazratbal_Srinagar.jpg" },
  "gal-007": { day: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Munnar_Overview.jpg/800px-Munnar_Overview.jpg" },
  "gal-008": { day: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Siberian_Tiger_by_Vassil.jpg/800px-Siberian_Tiger_by_Vassil.jpg" },
  "gal-009": { day: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Periyar_National_Park.JPG/800px-Periyar_National_Park.JPG" },
  "gal-010": { day: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Hyderabadi_Chicken_Biryani.jpg/800px-Hyderabadi_Chicken_Biryani.jpg" },
  "gal-011": { day: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Chole_bhature_by_a_street_vendor_in_Delhi.jpg/800px-Chole_bhature_by_a_street_vendor_in_Delhi.jpg" },
  "gal-012": { day: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/South_Indian_Meals.jpg/800px-South_Indian_Meals.jpg" },
  "gal-013": { day: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Festival_of_colors.jpg/800px-Festival_of_colors.jpg" },
  "gal-014": { day: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Diwali_lamps.jpg/800px-Diwali_lamps.jpg" },
  "gal-015": { day: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Durga_Puja_2013_in_Kolkata.jpg/800px-Durga_Puja_2013_in_Kolkata.jpg" }
};

const galleryPath = 'client/src/data/gallery.json';
const galleryData = JSON.parse(fs.readFileSync(galleryPath, 'utf8'));

for (const item of galleryData) {
  const urls = directUrls[item.id];
  if (urls) {
    item.imageUrl = urls.day;
    item.dayImageUrl = urls.day;
    item.nightImageUrl = urls.night || null;
    item.hasDayNight = !!urls.night;
  }
}

fs.writeFileSync(galleryPath, JSON.stringify(galleryData, null, 2));
console.log('gallery.json updated with hardcoded reliable Wikipedia direct URLs.');
