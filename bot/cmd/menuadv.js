const { getGroupSettings } = require('../lib/db');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            let groupName = 'Bot';
            let mode = 'public';
            if (from.endsWith('@g.us')) {
                try {
                    const groupMetadata = await sock.groupMetadata(from);
                    groupName = groupMetadata.subject;
                } catch (e) {}
                mode = getGroupSettings(from).mode || 'public';
            }

            let text = `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`;
            text += `┃  📜 *MENU COMPLET* 📜\n`;
            text += `┃  ${groupName}\n`;
            text += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;

            text += `*🔐 PROTECTIONS:*\n`;
            text += `✦ .mode private/public\n`;
            text += `✦ .antilink on/off\n`;
            text += `✦ .antibot on/off\n`;
            text += `✦ .antispam on/off\n`;
            text += `✦ .antitoxic on/off\n`;
            text += `✦ .antidelete on/off\n`;
            text += `✦ .antivideo on/off\n`;
            text += `✦ .antiaudio on/off\n`;
            text += `✦ .antiimage on/off\n`;
            text += `✦ .antisticker on/off\n`;
            text += `✦ .antitag on/off\n`;
            text += `✦ .antiviewonce on/off\n\n`;

            text += `*👮 GESTION ADMIN:*\n`;
            text += `✦ .kick (répondre ou @user)\n`;
            text += `✦ .kick +239 (par indicatif pays)\n`;
            text += `✦ .kickall\n`;
            text += `✦ .promote / .demote\n`;
            text += `✦ .ban / .unban\n`;
            text += `✦ .warn / .admins\n\n`;

            text += `*ℹ️ INFORMATIONS:*\n`;
            text += `✦ .ginfo / .getinfo / .getid\n`;
            text += `✦ .settings / .stats / .botinfo\n\n`;

            text += `*📥 TÉLÉCHARGEURS:*\n`;
            text += `✦ .vv (répondre) / .fb / .ig / .tiktok / .yt / .play\n\n`;

            text += `*🎮 JEUX:*\n`;
            text += `✦ .quiz / .truth / .dare / .flip / .joke\n\n`;

            text += `*📢 UTILITAIRES:*\n`;
            text += `✦ .ping / .del / .lock / .unlock / .mute\n\n`;

            text += `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`;
            text += `┃ Version: V1.1.9\n`;
            text += `┃ Mode: ${mode}\n`;
            text += `┃ 💡 .menu pour la liste complète par catégorie\n`;
            text += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

            await sock.sendMessage(from, { text });
        } catch (error) {
            console.error('Erreur menuadv:', error);
            await sock.sendMessage(from, { text: '❌ Erreur lors du chargement' });
        }
    }
};
