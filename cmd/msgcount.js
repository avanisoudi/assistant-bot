const { getGroupStats } = require('../lib/stats');

module.exports = {
    execute: async (sock, msg, from, args) => {
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ Groupe uniquement !" });
        }

        const metadata = await sock.groupMetadata(from);
        const stats = getGroupStats(from);
        const users = Object.entries(stats.users);

        if (users.length === 0) {
            return sock.sendMessage(from, { text: "📊 Aucune statistique enregistrée." });
        }

        // Trie par nombre de messages
        users.sort((a, b) => b[1].count - a[1].count);

        // Position de chaque membre du groupe
        const participants = metadata.participants;
        let ranking = [];
        
        participants.forEach(p => {
            const userData = stats.users[p.id];
            ranking.push({
                id: p.id,
                count: userData ? userData.count : 0,
                admin: p.admin
            });
        });

        ranking.sort((a, b) => b.count - a.count);

        let text = `╭───「 🔢 *CLASSEMENT COMPLET* 」\n`;
        text += `│ 📛 *${metadata.subject}*\n`;
        text += `│\n`;

        // Affiche top 30
        const top = ranking.slice(0, 30);
        top.forEach((user, i) => {
            const num = String(i + 1).padStart(2, '0');
            const crown = user.admin === 'superadmin' ? ' 👑' : user.admin === 'admin' ? ' ⭐' : '';
            text += `│ ${num}. @${user.id.split('@')[0]}${crown} — *${user.count}* msgs\n`;
        });

        if (ranking.length > 30) {
            text += `│ ...\n`;
            text += `│ (${ranking.length - 30} autres membres)\n`;
        }

        text += `│\n`;
        text += `│ 📊 Total : *${stats.totalMessages}* messages\n`;
        text += `╰──────────────────`;

        const mentions = top.map(u => u.id);
        await sock.sendMessage(from, { text, mentions });
    }
};
