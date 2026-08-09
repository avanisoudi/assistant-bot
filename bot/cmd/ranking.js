const { getAllUsers } = require('../lib/economy');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const db = getAllUsers();
            const sender = msg.key.participant || msg.key.remoteJid;
            const sorted = Object.entries(db).sort((a, b) => (b[1].coins || 0) - (a[1].coins || 0));
            const position = sorted.findIndex(([id]) => id === sender) + 1;

            let text = `📊 *TON CLASSEMENT*\n\n`;
            text += position > 0 ? `🏅 Position: #${position} sur ${sorted.length} joueurs\n` : `🏅 Pas encore classé (utilise .daily pour commencer!)\n`;
            text += `\n💡 .leaderboard pour voir le top 10`;

            await sock.sendMessage(from, { text });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
