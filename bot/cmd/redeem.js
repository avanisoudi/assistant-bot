const fs = require('fs');
const path = require('path');
const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');

const dbPath = path.join(__dirname, '..', 'db', 'redeemCodes.json');

// Codes cadeaux par défaut (modifiable directement dans db/redeemCodes.json)
const DEFAULT_CODES = {
    'BIENVENUE2026': { coins: 200, usedBy: [] },
    'ASSISTANTBOT': { coins: 150, usedBy: [] }
};

function loadCodes() {
    try {
        if (!fs.existsSync(dbPath)) {
            fs.writeFileSync(dbPath, JSON.stringify(DEFAULT_CODES, null, 2));
            return DEFAULT_CODES;
        }
        return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    } catch { return DEFAULT_CODES; }
}
function saveCodes(d) { fs.writeFileSync(dbPath, JSON.stringify(d, null, 2)); }

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🎁 .redeem <code>\nÀ utiliser en message privé au bot de préférence.' });

            const code = args[0].toUpperCase();
            const codes = loadCodes();
            const sender = msg.key.participant || msg.key.remoteJid;

            if (!codes[code]) return await sock.sendMessage(from, { text: '❌ Code invalide ou expiré' });
            if (codes[code].usedBy.includes(sender)) return await sock.sendMessage(from, { text: '❌ Tu as déjà utilisé ce code' });

            getUser(sender);
            const db = loadEconomy();
            db[sender].coins += codes[code].coins;
            saveEconomy(db);

            codes[code].usedBy.push(sender);
            saveCodes(codes);

            await sock.sendMessage(from, { text: `🎉 Code "${code}" validé !\n💰 +${codes[code].coins} coins\n🏦 Solde: ${db[sender].coins}` });
        } catch (error) {
            console.error('Erreur redeem:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
