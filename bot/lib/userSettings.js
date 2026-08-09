const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'userSettings.json');

function loadDB() { try { return fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf-8')) : {}; } catch { return {}; } }
function saveDB(d) { fs.writeFileSync(dbPath, JSON.stringify(d, null, 2)); }

function getSettings(userId) {
    const db = loadDB();
    if (!db[userId]) {
        db[userId] = { notifications: true, language: 'fr', theme: 'default' };
        saveDB(db);
    }
    return db[userId];
}

function setSetting(userId, key, value) {
    const db = loadDB();
    if (!db[userId]) db[userId] = getSettings(userId);
    db[userId][key] = value;
    saveDB(db);
    return db[userId];
}

module.exports = { getSettings, setSetting };
