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

        // Analyse détaillée
        const totalMessages = stats.totalMessages;
        const totalMembers = metadata.participants.length;
        const activeMembers = users.length;
        const inactiveMembers = totalMembers - activeMembers;
        const participationRate = ((activeMembers / totalMembers) * 100).toFixed(1);

        // Moyennes
        const avgPerMember = Math.round(totalMessages / activeMembers);
        const medianCount = users.map(([_, d]) => d.count).sort((a, b) => a - b)[Math.floor(users.length / 2)];

        // Plus actif / Moins actif
        const sorted = users.sort((a, b) => b[1].count - a[1].count);
        const mostActive = sorted[0];
        const leastActive = sorted[sorted.length - 1];

        // Analyse par heure
        let totalHours = {};
        users.forEach(([_, data]) => {
            Object.entries(data.hours).forEach(([hour, count]) => {
                totalHours[hour] = (totalHours[hour] || 0) + count;
            });
        });
        
        const sortedHours = Object.entries(totalHours).sort((a, b) => b[1] - a[1]);
        const peakHours = sortedHours.slice(0, 3);

        // Analyse par type
        let totalTypes = {};
        users.forEach(([_, data]) => {
            Object.entries(data.types).forEach(([type, count]) => {
                totalTypes[type] = (totalTypes[type] || 0) + count;
            });
        });

        // Ancienneté
        const days = Math.floor((Date.now() - (stats.createdAt || Date.now())) / (1000 * 60 * 60 * 24));
        const msgsPerDay = days > 0 ? Math.round(totalMessages / days) : totalMessages;

        let text = `╭───「 📊 *ANALYSE COMPLÈTE* 」\n`;
        text += `│\n`;
        text += `│ 📛 *${metadata.subject}*\n`;
        text += `│\n`;
        text += `│ *📈 VUE D'ENSEMBLE :*\n`;
        text += `│ 💬 Messages totaux : *${totalMessages}*\n`;
        text += `│ 📅 Depuis : *${days} jours*\n`;
        text += `│ 📊 Moyenne/jour : *${msgsPerDay}* msgs\n`;
        text += `│\n`;
        text += `│ *👥 PARTICIPATION :*\n`;
        text += `│ 👤 Membres actifs : *${activeMembers}* / ${totalMembers}\n`;
        text += `│ 😴 Membres inactifs : *${inactiveMembers}*\n`;
        text += `│ 📊 Taux participation : *${participationRate}%*\n`;
        text += `│ 📝 Moyenne/membre : *${avgPerMember}* msgs\n`;
        text += `│ 📏 Médiane : *${medianCount}* msgs\n`;
        text += `│\n`;
        text += `│ *🏆 EXTRÊMES :*\n`;
        if (mostActive) {
            text += `│ 🥇 Plus actif : @${mostActive[0].split('@')[0]} (${mostActive[1].count} msgs)\n`;
        }
        if (leastActive) {
            text += `│ 🐌 Moins actif : @${leastActive[0].split('@')[0]} (${leastActive[1].count} msgs)\n`;
        }
        text += `│\n`;
        text += `│ *⏰ HEURES DE POINTE :*\n`;
        peakHours.forEach(([hour, count], i) => {
            const medals = ['🥇', '🥈', '🥉'];
            text += `│ ${medals[i]} ${hour}h — ${count} msgs\n`;
        });
        text += `│\n`;
        text += `│ *📦 TYPES DE MESSAGES :*\n`;
        Object.entries(totalTypes).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
            const percent = ((count / totalMessages) * 100).toFixed(1);
            text += `│ • ${type} : ${count} (${percent}%)\n`;
        });
        text += `│\n`;
        text += `│ *💡 INSIGHTS :*\n`;
        
        // Insights automatiques
        if (parseFloat(participationRate) < 50) {
            text += `│ ⚠️ Faible participation (${participationRate}%)\n`;
        }
        if (mostActive && mostActive[1].count > totalMessages * 0.3) {
            text += `│ ⚠️ Un membre domine la conversation\n`;
        }
        if (msgsPerDay < 5) {
            text += `│ 😴 Groupe peu actif\n`;
        } else if (msgsPerDay > 100) {
            text += `│ 🔥 Groupe très actif !\n`;
        }
        
        text += `╰──────────────────`;

        const mentions = [];
        if (mostActive) mentions.push(mostActive[0]);
        if (leastActive) mentions.push(leastActive[0]);

        await sock.sendMessage(from, { text, mentions });
    }
};
