const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');
const BUSINESSES = {
    'kiosque': { price: 500, income: 50 },
    'boutique': { price: 1500, income: 180 },
    'restaurant': { price: 4000, income: 500 },
    'hotel': { price: 10000, income: 1400 }
};
const INCOME_INTERVAL = 6 * 60 * 60 * 1000; // 6h pour cumuler le revenu max

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);

            if (!args[0]) {
                let text = `🏢 *TES BUSINESS*\n\n`;
                if (!user.business) {
                    text += `Tu n'as encore aucun business.\n\n🛍️ *DISPONIBLES:*\n`;
                    for (const [name, b] of Object.entries(BUSINESSES)) {
                        text += `${name} — ${b.price} coins (${b.income}/6h)\n`;
                    }
                    text += `\n.business buy <nom>`;
                } else {
                    text += `🏢 ${user.business}\n💵 .business collect pour récupérer les revenus`;
                }
                return await sock.sendMessage(from, { text });
            }

            if (args[0] === 'buy') {
                const name = args[1]?.toLowerCase();
                const biz = BUSINESSES[name];
                if (!biz) return await sock.sendMessage(from, { text: `❌ Business inconnu. Dispo: ${Object.keys(BUSINESSES).join(', ')}` });
                if (user.coins < biz.price) return await sock.sendMessage(from, { text: `❌ Il te faut ${biz.price} coins` });

                const db = loadEconomy();
                db[sender].coins -= biz.price;
                db[sender].business = name;
                db[sender].lastBusinessCollect = Date.now();
                saveEconomy(db);
                return await sock.sendMessage(from, { text: `✅ Business acheté: ${name}!\nRevient collecter avec .business collect` });
            }

            if (args[0] === 'collect') {
                if (!user.business) return await sock.sendMessage(from, { text: `❌ Tu n'as pas de business. Achète-en un avec .business buy <nom>` });
                const biz = BUSINESSES[user.business];
                const elapsed = Date.now() - (user.lastBusinessCollect || 0);
                const cycles = Math.min(4, Math.floor(elapsed / INCOME_INTERVAL));
                if (cycles <= 0) {
                    const left = INCOME_INTERVAL - elapsed;
                    return await sock.sendMessage(from, { text: `⏳ Reviens dans ${Math.floor(left / 3600000)}h ${Math.floor((left % 3600000) / 60000)}m` });
                }
                const earned = cycles * biz.income;
                const db = loadEconomy();
                db[sender].coins += earned;
                db[sender].lastBusinessCollect = Date.now();
                saveEconomy(db);
                await sock.sendMessage(from, { text: `💵 Revenus collectés: +${earned} coins\n🏦 Solde: ${db[sender].coins}` });
            }
        } catch (error) {
            console.error('Erreur business:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
