const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');
const WHEEL = [
    { label: '💥 Rien', mult: -1, weight: 30 },
    { label: '🔻 Moitié', mult: -0.5, weight: 25 },
    { label: '➡️ Égal', mult: 0, weight: 20 },
    { label: '✨ x1.5', mult: 0.5, weight: 15 },
    { label: '🎉 x2', mult: 1, weight: 8 },
    { label: '💎 x5', mult: 4, weight: 2 }
];

function pickWeighted() {
    const total = WHEEL.reduce((s, w) => s + w.weight, 0);
    let r = Math.random() * total;
    for (const w of WHEEL) {
        if (r < w.weight) return w;
        r -= w.weight;
    }
    return WHEEL[0];
}

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const bet = parseInt(args[0]);
            if (!bet || bet <= 0) return await sock.sendMessage(from, { text: `🎡 .spin <mise>\nExemple: .spin 100` });

            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);
            if (user.coins < bet) return await sock.sendMessage(from, { text: `❌ Solde insuffisant (tu as ${user.coins} coins)` });

            const result = pickWeighted();
            const change = Math.floor(bet * result.mult);

            const db = loadEconomy();
            db[sender].coins = Math.max(0, db[sender].coins + change);
            saveEconomy(db);

            await sock.sendMessage(from, {
                text: `🎡 *ROUE DE LA FORTUNE*\n\n${result.label}\n\n${change >= 0 ? '🎉 +' : ''}${change} coins\n🏦 Solde: ${db[sender].coins}`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
