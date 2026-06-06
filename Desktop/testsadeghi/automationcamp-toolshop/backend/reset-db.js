const fs = require('fs');
const path = require('path');

const seed = path.join(__dirname, 'db.seed.json');
const db = path.join(__dirname, 'db.json');

if (!fs.existsSync(seed)) {
  console.error('❌  db.seed.json not found. Cannot reset.');
  process.exit(1);
}

fs.copyFileSync(seed, db);
console.log('✅  Database reset to original seed data.');
console.log('⚡  Restart the server (npm start) to apply changes.');
