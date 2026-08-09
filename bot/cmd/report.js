const { addEntry } = require('../lib/feedback');
const { notifyBotAdmins } = require('../lib/botAdmins');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned && mentioned[0];
            const reason = args.filter(a => !a.startsWith('@')).join(' ');

            if (!target && !reason) return await sock.sendMessage(from, { text: `🚨 .report @user <raison>\nSignale un comportement problématique aux admins` });

            const sender = msg.key.participant || msg.key.remoteJid;
            const id = addEntry('report', sender, `Cible: ${target || 'N/A'} | Raison: ${reason || 'Non précisée'}`);

            await notifyBotAdmins(sock, {
                text: `🚨 *NOUVEAU SIGNALEMENT #${id}*\n\n👤 Par: @${sender.split('@')[0]}\n🎯 Cible: ${target ? '@' + target.split('@')[0] : 'N/A'}\n📝 Raison: ${reason || 'Non précisée'}`,
                mentions: [sender, target].filter(Boolean)
            });

            await sock.sendMessage(from, { text: `✅ Signalement #${id} envoyé aux administrateurs du bot` });
        } catch (error) {
            console.error('Erreur report:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
