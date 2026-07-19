const { getGroupStats } = require('../lib/stats');

module.exports = {
    execute: async (sock, msg, from, args) => {
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ Groupe uniquement !" });
        }

        // Vérifie si admin (commande sensible)
        const sender = msg.key.participant || msg.key.remoteJid;
        const metadata = await sock.groupMetadata(from);
        const senderInfo = metadata.participants.find(p => p.id === sender);
        if (!senderInfo || !senderInfo.admin) {
            return sock.sendMessage(from, { text: "❌ Réservé aux admins !" });
        }

        // Récupère la cible
        let target = null;
        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
            target = msg.message.extendedTextMessage.contextInfo.participant;
        } else if (args.length > 0) {
            target = `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net`;
        }

        if (!target) {
            return sock.sendMessage(from, { text: "❌ Usage : `.stalk @user` ou réponds à un message" });
        }

        const stats = getGroupStats(from);
        const userData = stats.users[target];

        if (!userData) {
            return sock.sendMessage(from, { 
                text: `📊 Aucune donnée pour @${target.split('@')[0]}`,
                mentions: [target]
            });
        }

        // Analyse
        const totalMessages = stats.totalMessages;
        const participation = ((userData.count / totalMessages) * 100).toFixed(2);
        
        // Heure favorite
        const favoriteHour = Object.entries(userData.hours).sort((a, b) => b[1] - a[1])[0];
        const favHourStr = favoriteHour ? `${favoriteHour[0]}h` : "N/A";
        
        // Type favori
        const favoriteType = Object.entries(userData.types).sort((a, b) => b[1] - a[1])[0];
        const favTypeStr = favoriteType ? favoriteType[0] : "N/A";
        
        // Mots les plus utilisés
        const wordCount = {};
        userData.words.forEach(w => {
            wordCount[w] = (wordCount[w] || 0) + 1;
        });
        const topWords = Object.entries(wordCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
        
        // Ancienneté
        const daysSinceFirst = Math.floor((Date.now() - userData.firstSeen) / (1000 * 60 * 60 * 24));
        const daysSinceLast = Math.floor((Date.now() - userData.lastSeen) / (1000 * 60 * 60 * 24));
        const lastSeenStr = daysSinceLast === 0 ? "aujourd'hui" : daysSinceLast === 1 ? "hier" : `il y a ${daysSinceLast} jours`;

        // Position dans le classement
        const allUsers = Object.entries(stats.users).sort((a, b) => b[1].count - a[1].count);
        const rank = allUsers.findIndex(([id]) => id === target) + 1;

        let text = `╭───「 🕵️ *STALK : @${target.split('@')[0]}* 」\n`;
        text += `│\n`;
        text += `│ *📊 ACTIVITÉ :*\n`;
        text += `│ 💬 Messages : *${userData.count}*\n`;
        text += `│ 📈 Part du groupe : *${participation}%*\n`;
        text += `│ 🏆 Rang : *#${rank}* / ${allUsers.length}\n`;
        text += `│ 📅 Présent depuis : *${daysSinceFirst} jours*\n`;
        text += `│ 👁️ Vu pour la dernière fois : *${lastSeenStr}*\n`;
        text += `│\n`;
        text += `│ *⏰ HABITUDES :*\n`;
        text += `│ 🕐 Heure favorite : *${favHourStr}*\n`;
        text += `│ 📦 Type favori : *${favTypeStr}*\n`;
        text += `│\n`;
        text += `│ *📝 RÉPARTITION :*\n`;
        Object.entries(userData.types).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
            text += `│ • ${type} : ${count}\n`;
        });
        
        if (topWords.length > 0) {
            text += `│\n`;
            text += `│ *🔤 MOTS FAVORIS :*\n`;
            topWords.forEach(([word, count]) => {
                text += `│ • "${word}" (${count}x)\n`;
            });
        }
        
        if (userData.lastMessages.length > 0) {
            text += `│\n`;
            text += `│ *💬 DERNIERS MESSAGES :*\n`;
            userData.lastMessages.slice(-3).reverse().forEach(m => {
                const time = new Date(m.time).toLocaleString('fr-FR', { 
                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
                });
                const preview = m.text.length > 40 ? m.text.substring(0, 40) + '...' : m.text;
                text += `│ • [${time}] ${preview}\n`;
            });
        }
        
        text += `╰──────────────────`;

        await sock.sendMessage(from, { text, mentions: [target] });
    }
};
