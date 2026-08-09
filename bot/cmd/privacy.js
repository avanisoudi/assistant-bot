const { getSettings, setSetting } = require('../lib/userSettings');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const option = args[0]?.toLowerCase();

            if (option === 'hide') {
                setSetting(sender, 'hideFromLeaderboard', true);
                return await sock.sendMessage(from, { text: '🔒 Ton profil n\'apparaîtra plus dans .leaderboard' });
            }
            if (option === 'show') {
                setSetting(sender, 'hideFromLeaderboard', false);
                return await sock.sendMessage(from, { text: '🔓 Ton profil apparaît de nouveau dans .leaderboard' });
            }

            const s = getSettings(sender);
            const status = s.hideFromLeaderboard ? '🔒 Caché' : '🔓 Visible';
            await sock.sendMessage(from, { text: `🔐 *CONFIDENTIALITÉ*\n\nVisibilité dans .leaderboard: ${status}\n\n.privacy hide — se cacher\n.privacy show — redevenir visible` });
        } catch (error) {
            console.error('Erreur privacy:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
