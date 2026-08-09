const fs = require('fs');
const path = require('path');
const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');
const cryptoPath = path.join(__dirname, '..', 'db', 'crypto.json');

function getPrice() {
    let data = { price: 100, updated: 0 };
    try { if (fs.existsSync(cryptoPath)) data = JSON.parse(fs.readFileSync(cryptoPath, 'utf-8')); } catch {}
    // Le prix change toutes les 10 minutes
    if (Date.now() - data.updated > 10 * 60 * 1000) {
        const change = (Math.random() * 0.4) - 0.2; // -20% à +20%
        data.price = Math.max(10, Math.floor(data.price * (1 + change)));
        data.updated = Date.now();
        fs.writeFileSync(cryptoPath, JSON.stringify(data));
    }
    return data.price;
}

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const price = getPrice();
            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);
            const holding = (user.stocks && user.stocks['BOTCOIN']) || { shares: 0 };

            if (!args[0]) {
                return await sock.sendMessage(from, {
                    text: `🪙 *BOTCOIN*\n\n💲 Prix actuel: ${price} coins\n📊 Tu possèdes: ${holding.shares} BOTCOIN\n\n.crypto buy <qty>\n.crypto sell <qty>`
                });
            }

            const qty = parseInt(args[1]);
            if (!qty || qty <= 0) return await sock.sendMessage(from, { text: `❌ Quantité invalide` });

            const db = loadEconomy();
            if (!db[sender].stocks) db[sender].stocks = {};
            if (!db[sender].stocks['BOTCOIN']) db[sender].stocks['BOTCOIN'] = { shares: 0, avgPrice: 0 };

            if (args[0] === 'buy') {
                const cost = price * qty;
                if (db[sender].coins < cost) return await sock.sendMessage(from, { text: `❌ Il te faut ${cost} coins (tu as ${db[sender].coins})` });
                db[sender].coins -= cost;
                db[sender].stocks['BOTCOIN'].shares += qty;
                db[sender].stocks['BOTCOIN'].avgPrice = price;
                saveEconomy(db);
                await sock.sendMessage(from, { text: `✅ Acheté ${qty} BOTCOIN pour ${cost} coins\n🏦 Solde: ${db[sender].coins}` });
            } else if (args[0] === 'sell') {
                if (db[sender].stocks['BOTCOIN'].shares < qty) return await sock.sendMessage(from, { text: `❌ Tu n'as que ${db[sender].stocks['BOTCOIN'].shares} BOTCOIN` });
                const gain = price * qty;
                db[sender].stocks['BOTCOIN'].shares -= qty;
                db[sender].coins += gain;
                saveEconomy(db);
                await sock.sendMessage(from, { text: `✅ Vendu ${qty} BOTCOIN pour ${gain} coins\n🏦 Solde: ${db[sender].coins}` });
            }
        } catch (error) {
            console.error('Erreur crypto:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
