const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'groups.json');

function loadDB() {
    if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
        fs.writeFileSync(dbPath, JSON.stringify({}));
        return {};
    }
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

function saveDB(db) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function getGroupSettings(groupId) {
    const db = loadDB();
    if (!db[groupId]) {
        db[groupId] = {
            antilink: false,
            antibot: false,
            antiflood: false,
            antitoxic: false,
            antidelete: false,
            welcome: false,
            goodbye: false,
            autoread: false,
            autotype: false,
            toxicWords: ['putain', 'merde', 'connard', 'fdp', 'ntm', 'salaud']
        };
        saveDB(db);
    }
    return db[groupId];
}

function setGroupSetting(groupId, key, value) {
    const db = loadDB();
    if (!db[groupId]) db[groupId] = {};
    db[groupId][key] = value;
    saveDB(db);
}

module.exports = { getGroupSettings, setGroupSetting, loadDB, saveDB };
