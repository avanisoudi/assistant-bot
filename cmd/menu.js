const fs = require('fs');
const path = require('path');

module.exports = {
    execute: async (sock, msg, from, args) => {
        // Récupération du préfixe depuis la config
        const configPath = path.join(__dirname, '..', 'config.json');
        const config = require(configPath);
        const prefix = config.prefix;

        // Scan dynamique de toutes les commandes dans le dossier cmd/
        const cmdFolder = path.join(__dirname);
        const commands = fs.readdirSync(cmdFolder)
            .filter(file => file.endsWith('.js'))
            .map(file => file.replace('.js', ''));

        // Infos utilisateur
        const sender = msg.key.participant || msg.key.remoteJid;
        const pushname = msg.pushName || "Utilisateur";
        const mention = `@${sender.split('@')[0]}`;

        // Date et heure
        const now = new Date();
        const date = now.toLocaleDateString('fr-FR', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
        const time = now.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', minute: '2-digit' 
        });

        // Construction du menu stylé
        let text = ``;
        text += `╭───「 *★ 𝐀𝐬𝐬𝐢𝐬𝐭𝐚𝐧𝐭 𝐁𝐨𝐭 ★* 」\n`;
        text += `│\n`;
        text += `│  👋 Salut *${pushname}*\n`;
        text += `│  📅 ${date}\n`;
        text += `│  🕐 ${time}\n`;
        text += `│  📂 *${commands.length}* commandes disponibles\n`;
        text += `│  ⚙️ Préfixe : *${prefix}*\n`;
        text += `│\n`;
        text += `╰──────────────────\n\n`;

        text += `╭───「 *📜 LISTE DES COMMANDES* 」\n`;
        // Construction de la liste avec emojis
        const emojiMap = {
            'antilink': '✦', 'antibot': '✦', 'antispam': '✦', 'antitoxic': '✦', 'antidelete': '✦',
            'add': '✦', 'kick': '✦', 'promote': '✦', 'demote': '✦', 'admins': '✦', 'warn': '✦', 'tag': '✦',
            'chatstats': '✦', 'groupanalysts': '✦', 'mostactive': '✦', 'msgcount': '✦', 'wordcloud': '✦',
            'prefix': '✦', 'setname': '✦', 'setdesc': '✦', 'setpp': '✦', 'lock': '✦', 'unlock': '✦',
            'autoread': '✦', 'autotype': '✦', 'rsticker': '✦', 'stlak': '✦', 'welcome': '✦', 'goodbye': '✦',
            'ping': '✦', 'menu': '✦', 'del': '✦', 'ephemeral': '✦', 'ginfo': '✦', 'linkgroup': '✦',
            'list': '✦', 'revoke': '✦', 'set': '✦'
        };

        commands.forEach((cmd, i) => {
            const emoji = emojiMap[cmd] || '✦';
            text += `│ ${emoji} ${prefix}*${cmd}*
`;
        });
        text += `╰──────────────────\n\n`;

        text += `╭───「 *💡 ASTUCES* 」\n`;
        text += `│ • Utilise *${prefix}<commande>* pour exécuter\n`;
        text += `│ • Exemple : *${prefix}menu*\n`;
        text += `│ • Les commandes sont en *mise à jour auto*\n`;
        text += `╰──────────────────\n\n`;

        text += `> 🚀 *𝐁𝐨𝐭 𝐩𝐫𝐨𝐩𝐮𝐥𝐬𝐞 𝐩𝐚𝐫 𝐀𝐬𝐬𝐢𝐬𝐭𝐚𝐧𝐭-𝐀𝐯𝐚𝐧𝐢*`;

        // Envoi avec mention de l'utilisateur
        await sock.sendMessage(from, { 
            text: text,
            mentions: [sender]
        });
    }
};
