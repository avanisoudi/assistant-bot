const { getGroupStats } = require('../lib/stats');

module.exports = {
    execute: async (sock, msg, from, args) => {
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ Groupe uniquement !" });
        }

        const stats = getGroupStats(from);
        const users = Object.entries(stats.users);

        if (users.length === 0) {
            return sock.sendMessage(from, { text: "📊 Aucune statistique enregistrée pour ce groupe." });
        }

        // Trie par nombre de messages
        users.sort((a, b) => b[1].count - a[1].count);
        const top10 = users.slice(0, 10);
        const maxCount = top10[0][1].count;

        let text = `╭───「 🏆 *TOP 10 ACTIFS* 」\n`;
        text += `│\n`;
        
        const medals = ['🥇', '🥈', '🥉'];
        top10.forEach(([userId, data], i) => {
            const medal = medals[i] || `#${i + 1}`;
            const bar = '█'.repeat(Math.round((data.count / maxCount) * 10));
            text += `│ ${medal} @${userId.split('@')[0]}\n`;
            text += `│    ${bar} *${data.count}* msgs\n`;
        });
        
        text += `│\n`;
        text += `│ 📊 Total : *${stats.totalMessages}* messages\n`;
        text += `│ 👥 Membres actifs : *${users.length}*\n`;
        text += `╰──────────────────`;

        const mentions = top10.map(([id]) => id);
        await sock.sendMessage(from, { text, mentions });
    }
};
