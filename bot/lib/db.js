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
            antispam: false,
            antitoxic: false,
            antidelete: false,
            antivideo: false,
            antiaudio: false,
            antiimage: false,
            antisticker: false,
            antitag: false,
            antiforbidden: false,
            antidemote: false,
            antipromote: false,
            antipurge: false,
            antistatut: false,
            antitransfer: false,
            antiviewonce: false,
            rules: '',
            mode: 'public',
            filters: [],
            welcome: false,
            goodbye: false,
            autoread: false,
            autotype: false,
            toxicWords: ['putain', 'merde', 'connard', 'fdp', 'ntm', 'salaud']
        };
        saveDB(db);
    }
    // Complète les champs manquants pour les groupes créés avant cette mise à jour
    let changed = false;
    const defaults = { antispam: false, antivideo: false, antiaudio: false, antiimage: false, antisticker: false, antitag: false, antiforbidden: false, antidemote: false, antipromote: false, antipurge: false, antistatut: false, antitransfer: false, antiviewonce: false, rules: '', mode: 'public', filters: [] };
    for (const [key, val] of Object.entries(defaults)) {
        if (!(key in db[groupId])) { db[groupId][key] = val; changed = true; }
    }
    if (changed) saveDB(db);
    return db[groupId];
}

function setGroupSetting(groupId, key, value) {
    const db = loadDB();
    if (!db[groupId]) db[groupId] = {};
    db[groupId][key] = value;
    saveDB(db);
}

module.exports = { getGroupSettings, setGroupSetting, loadDB, saveDB };
