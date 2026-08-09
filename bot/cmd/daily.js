const fs = require('fs');
const path = require('path');
const { getSettings } = require('../lib/userSettings');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const dbPath = path.join(__dirname, '..', 'db', 'economy.json');
            let economy = {};

            if (fs.existsSync(dbPath)) {
                economy = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            }

            if (!economy[sender]) {
                economy[sender] = { coins: 0, lastDaily: 0 };
            }

            const now = Date.now();
            const lastDaily = economy[sender].lastDaily || 0;
            const dayMs = 24 * 60 * 60 * 1000;

            if (now - lastDaily < dayMs) {
                const timeLeft = dayMs - (now - lastDaily);
                const hours = Math.floor(timeLeft / (60 * 60 * 1000));
                const mins = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
                return await sock.sendMessage(from, {
                    text: `⏳ Reviens dans ${hours}h ${mins}m pour ta récompense!`
                });
            }

            let reward = Math.floor(Math.random() * (500 - 100 + 1)) + 100;
            let multiplierUsed = false;
            if (economy[sender].multiplicateurActive) {
                reward *= 2;
                economy[sender].multiplicateurActive = false;
                multiplierUsed = true;
            }
            economy[sender].coins = (economy[sender].coins || 0) + reward;
            economy[sender].lastDaily = now;

            fs.writeFileSync(dbPath, JSON.stringify(economy, null, 2));

            const userSettings = getSettings(sender);
            if (userSettings.dailyReminder) {
                setTimeout(async () => {
                    try {
                        await sock.sendMessage(sender, { text: '🔔 Ta récompense .daily est de nouveau disponible !' });
                    } catch (e) { console.error('Erreur envoi rappel daily:', e); }
                }, dayMs);
            }

            await sock.sendMessage(from, {
                text: `✅ *RÉCOMPENSE QUOTIDIENNE*\n\n💰 +${reward} coins${multiplierUsed ? ' (✨ multiplicateur x2 appliqué)' : ''}!\n🏦 Total: ${economy[sender].coins} coins`
            });
        } catch (error) {
            console.error('Erreur daily:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
