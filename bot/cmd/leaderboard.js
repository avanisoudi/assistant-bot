const fs = require('fs');
const path = require('path');
const { getSettings } = require('../lib/userSettings');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const dbPath = path.join(__dirname, '..', 'db', 'economy.json');
            let economy = {};

            if (fs.existsSync(dbPath)) {
                economy = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            }

            const sorted = Object.entries(economy)
                .filter(([user]) => !getSettings(user).hideFromLeaderboard)
                .map(([user, data]) => ({ user, coins: data.coins || 0 }))
                .sort((a, b) => b.coins - a.coins)
                .slice(0, 10);

            let text = `🏆 *TOP 10 RICHESSE*\n\n`;
            sorted.forEach((entry, i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
                text += `${medal} @${entry.user.split('@')[0]}: ${entry.coins} 🪙\n`;
            });

            await sock.sendMessage(from, { text });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
