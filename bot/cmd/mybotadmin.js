const { BOT_ADMIN_NUMBERS, isBotAdmin } = require('../lib/botAdmins');

// Commande de diagnostic — permet de voir précisément pourquoi le statut
// "admin du bot" est reconnu ou non, sans avoir à deviner à distance.
module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const normalized = sender.split('@')[0].split(':')[0];
            const result = await isBotAdmin(sender, sock);

            let text = `🔍 *DIAGNOSTIC ADMIN DU BOT*\n\n`;
            text += `📱 Ton JID brut: ${sender}\n`;
            text += `🔢 Numéro détecté: ${normalized}\n`;
            text += `✅ Admin du bot: ${result ? 'OUI' : 'NON'}\n\n`;
            text += `📋 Numéros configurés:\n${BOT_ADMIN_NUMBERS.map(n => `• ${n}${n === normalized ? ' ← toi' : ''}`).join('\n')}\n\n`;

            if (!result) {
                text += `⚠️ Si ton numéro ci-dessus est correct mais absent de la liste, ajoute-le dans lib/botAdmins.js.\n`;
                text += `⚠️ Si ton numéro affiché semble incorrect/étrange (pas ton vrai numéro), c'est que WhatsApp t'identifie différemment ici — dis-moi ce numéro détecté, je peux l'ajouter directement.`;
            }

            await sock.sendMessage(from, { text });
        } catch (error) {
            console.error('Erreur mybotadmin:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
