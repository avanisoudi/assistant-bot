const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'economy.json');

function loadEconomy() {
    try {
        if (!fs.existsSync(dbPath)) {
            fs.mkdirSync(path.dirname(dbPath), { recursive: true });
            fs.writeFileSync(dbPath, JSON.stringify({}));
            return {};
        }
        return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    } catch {
        return {};
    }
}

function saveEconomy(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function getUser(userId) {
    const db = loadEconomy();
    if (!db[userId]) {
        db[userId] = {
            coins: 0,
            lastDaily: 0,
            lastWork: 0,
            lastMining: 0,
            lastTreasure: 0,
            lastQuest: 0,
            inventory: [],
            stocks: {},
            bounties: 0
        };
        saveEconomy(db);
    }
    // S'assure que les anciens comptes ont bien tous les champs
    if (!db[userId].inventory) db[userId].inventory = [];
    if (!db[userId].stocks) db[userId].stocks = {};
    return db[userId];
}

function addCoins(userId, amount) {
    const db = loadEconomy();
    if (!db[userId]) db[userId] = getUser(userId);
    db[userId].coins = Math.max(0, (db[userId].coins || 0) + amount);
    saveEconomy(db);
    return db[userId].coins;
}

function setUserField(userId, field, value) {
    const db = loadEconomy();
    if (!db[userId]) db[userId] = getUser(userId);
    db[userId][field] = value;
    saveEconomy(db);
}

function getAllUsers() {
    return loadEconomy();
}

module.exports = { loadEconomy, saveEconomy, getUser, addCoins, setUserField, getAllUsers };
