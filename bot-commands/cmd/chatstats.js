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

        // Calcule les stats globales
        let totalTypes = {};
        let totalHours = {};
        let totalWords = 0;

        users.forEach(([_, data]) => {
            Object.entries(data.types).forEach(([type, count]) => {
                totalTypes[type] = (totalTypes[type] || 0) + count;
            });
            Object.entries(data.hours).forEach(([hour, count]) => {
                totalHours[hour] = (totalHours[hour] || 0) + count;
            });
            totalWords += data.words.length;
        });

        // Heure la plus active
        const peakHour = Object.entries(totalHours).sort((a, b) => b[1] - a[1])[0];
        const peakHourStr = peakHour ? `${peakHour[0]}h` : "N/A";

        // Type le plus utilisé
        const topType = Object.entries(totalTypes).sort((a, b) => b[1] - a[1])[0];
        const topTypeStr = topType ? topType[0] : "N/A";

        // Moyenne par membre
        const avgPerMember = Math.round(stats.totalMessages / users.length);

        // Ancienneté
        const days = Math.floor((Date.now() - (stats.createdAt || Date.now())) / (1000 * 60 * 60 * 24));

        let text = `╭───「 📈 *STATS DU GROUPE* 」\n`;
        text += `│\n`;
        text += `│ 📛 *${metadata.subject}*\n`;
        text += `│\n`;
        text += `│ 💬 Messages totaux : *${stats.totalMessages}*\n`;
        text += `│ 👥 Membres actifs : *${users.length}* / ${metadata.participants.length}\n`;
        text += `│ 📝 Moyenne/membre : *${avgPerMember}*\n`;
        text += `│ 📅 Tracking depuis : *${days} jours*\n`;
        text += `│\n`;
        text += `│ *📊 RÉPARTITION :*\n`;
        Object.entries(totalTypes).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([type, count]) => {
            const percent = ((count / stats.totalMessages) * 100).toFixed(1);
            text += `│  • ${type} : ${count} (${percent}%)\n`;
        });
        text += `│\n`;
        text += `│ *⏰ PIC D'ACTIVITÉ :*\n`;
        text += `│  🕐 Heure peak : *${peakHourStr}*\n`;
        text += `│  📝 Type dominant : *${topTypeStr}*\n`;
        text += `│  📖 Mots analysés : *${totalWords}*\n`;
        text += `╰──────────────────`;

        await sock.sendMessage(from, { text });
    }
};
