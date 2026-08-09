const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'feedback.json');

function loadDB() { try { return fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf-8')) : []; } catch { return []; } }
function saveDB(d) { fs.writeFileSync(dbPath, JSON.stringify(d, null, 2)); }

function addEntry(type, sender, content) {
    const db = loadDB();
    db.push({ type, sender, content, date: new Date().toISOString() });
    saveDB(db);
    return db.length;
}

module.exports = { loadDB, addEntry };
