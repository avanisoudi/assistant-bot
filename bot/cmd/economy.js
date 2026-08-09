const { getAllUsers } = require('../lib/economy');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const db = getAllUsers();
            const users = Object.values(db);
            const totalCoins = users.reduce((sum, u) => sum + (u.coins || 0), 0);
            const totalPlayers = users.length;
            const avg = totalPlayers ? Math.floor(totalCoins / totalPlayers) : 0;
            const richest = Math.max(0, ...users.map(u => u.coins || 0));

            await sock.sendMessage(from, {
                text: `📊 *ÉCONOMIE DU BOT*\n\n👥 Joueurs actifs: ${totalPlayers}\n💰 Coins en circulation: ${totalCoins.toLocaleString()}\n📈 Moyenne par joueur: ${avg}\n👑 Plus riche: ${richest.toLocaleString()} coins\n\n💡 Utilise .leaderboard pour voir le classement`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
