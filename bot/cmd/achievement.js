const { getUser } = require('../lib/economy');

const ACHIEVEMENTS = [
    { id: 'rookie', name: '🌱 Recrue', cond: u => u.coins >= 100 },
    { id: 'saver', name: '💰 Épargnant', cond: u => u.coins >= 1000 },
    { id: 'rich', name: '💎 Riche', cond: u => u.coins >= 10000 },
    { id: 'collector', name: '🎒 Collectionneur', cond: u => u.inventory.length >= 5 },
    { id: 'entrepreneur', name: '🏢 Entrepreneur', cond: u => !!u.business },
    { id: 'investor', name: '📈 Investisseur', cond: u => Object.keys(u.stocks || {}).length > 0 }
];

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);
            const unlocked = ACHIEVEMENTS.filter(a => a.cond(user));
            const locked = ACHIEVEMENTS.filter(a => !a.cond(user));

            let text = `🏆 *SUCCÈS*\n\n✅ Débloqués (${unlocked.length}/${ACHIEVEMENTS.length}):\n`;
            text += unlocked.length ? unlocked.map(a => a.name).join('\n') : 'Aucun pour le moment';
            text += `\n\n🔒 À débloquer:\n${locked.map(a => a.name).join('\n') || 'Tous débloqués! 🎉'}`;

            await sock.sendMessage(from, { text });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
