const fs = require('fs');
const path = require('path');
const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');
const stockPath = path.join(__dirname, '..', 'db', 'stockmarket.json');

const COMPANIES = ['AAPL', 'TSLA', 'GOOG', 'AMZN'];

function getPrices() {
    let data = {};
    try { if (fs.existsSync(stockPath)) data = JSON.parse(fs.readFileSync(stockPath, 'utf-8')); } catch {}
    let changed = false;
    COMPANIES.forEach(c => {
        if (!data[c]) { data[c] = { price: 100 + Math.floor(Math.random() * 200), updated: 0 }; changed = true; }
        if (Date.now() - data[c].updated > 10 * 60 * 1000) {
            const change = (Math.random() * 0.3) - 0.15;
            data[c].price = Math.max(5, Math.floor(data[c].price * (1 + change)));
            data[c].updated = Date.now();
            changed = true;
        }
    });
    if (changed) fs.writeFileSync(stockPath, JSON.stringify(data));
    return data;
}

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const prices = getPrices();
            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);

            if (!args[0] || !['buy', 'sell'].includes(args[0])) {
                let text = `📊 *BOURSE*\n\n`;
                COMPANIES.forEach(c => text += `${c}: ${prices[c].price} coins\n`);
                text += `\n.stock buy <TICKER> <qty>\n.stock sell <TICKER> <qty>`;
                return await sock.sendMessage(from, { text });
            }

            const ticker = args[1]?.toUpperCase();
            const qty = parseInt(args[2]);
            if (!COMPANIES.includes(ticker) || !qty || qty <= 0) {
                return await sock.sendMessage(from, { text: `❌ Utilise: .stock buy/sell <${COMPANIES.join('|')}> <qty>` });
            }

            const price = prices[ticker].price;
            const db = loadEconomy();
            if (!db[sender].stocks) db[sender].stocks = {};
            if (!db[sender].stocks[ticker]) db[sender].stocks[ticker] = { shares: 0, avgPrice: 0 };

            if (args[0] === 'buy') {
                const cost = price * qty;
                if (db[sender].coins < cost) return await sock.sendMessage(from, { text: `❌ Il te faut ${cost} coins` });
                db[sender].coins -= cost;
                db[sender].stocks[ticker].shares += qty;
                db[sender].stocks[ticker].avgPrice = price;
                saveEconomy(db);
                await sock.sendMessage(from, { text: `✅ Acheté ${qty} ${ticker} à ${price}/action (${cost} coins)\n🏦 Solde: ${db[sender].coins}` });
            } else {
                if ((db[sender].stocks[ticker]?.shares || 0) < qty) return await sock.sendMessage(from, { text: `❌ Tu n'as pas assez d'actions ${ticker}` });
                const gain = price * qty;
                db[sender].stocks[ticker].shares -= qty;
                db[sender].coins += gain;
                saveEconomy(db);
                await sock.sendMessage(from, { text: `✅ Vendu ${qty} ${ticker} pour ${gain} coins\n🏦 Solde: ${db[sender].coins}` });
            }
        } catch (error) {
            console.error('Erreur stock:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
