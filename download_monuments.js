const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'client', 'public', 'games');
if (!fs.existsSync(gamesDir)) {
  fs.mkdirSync(gamesDir, { recursive: true });
}

const imagesToDownload = {
  "monument-1.jpg": "https://upload.wikimedia.org/wikipedia/commons/b/bd/Taj_Mahal%2C_Agra%2C_India_edit3.jpg",
  "monument-2.jpg": "https://upload.wikimedia.org/wikipedia/commons/e/e9/Qutb_Minar_2009.jpg",
  "monument-3.jpg": "https://upload.wikimedia.org/wikipedia/commons/1/14/Hawa_Mahal_Jaipur.jpg",
  "monument-4.jpg": "https://upload.wikimedia.org/wikipedia/commons/6/66/Golden_Temple%2C_Amritsar.jpg",
  "monument-5.jpg": "https://upload.wikimedia.org/wikipedia/commons/0/09/Charminar_atnight.jpg",
  "monument-6.jpg": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Mumbai_03-2016_30_Gateway_of_India.jpg",
  "monument-7.jpg": "https://upload.wikimedia.org/wikipedia/commons/6/61/India_gate_on_a_cloudy_day.jpg",
  "monument-8.jpg": "https://upload.wikimedia.org/wikipedia/commons/7/74/Hampi_virupaksha_temple.jpg"
};

for (const [filename, url] of Object.entries(imagesToDownload)) {
  const dest = path.join(gamesDir, filename);
  console.log(`Downloading ${filename}...`);
  try {
    execSync(`curl -sL -A "Mozilla/5.0" "${url}" -o "${dest}"`);
  } catch(e) {
    console.log(`Failed to download ${filename}`);
  }
}

console.log('DONE DOWNLOADING MONUMENT IMAGES');
