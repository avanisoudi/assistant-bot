const { checkAdmin, checkBotAdmin } = require('../lib/adminCheck');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Groupe seulement' });
            const { isAdmin, debug } = await checkAdmin(sock, from, msg);
            if (!isAdmin) {
                console.log('[adminCheck] Refus admin:', JSON.stringify(debug));
                return await sock.sendMessage(from, { text: '❌ Réservé aux admins (ou créateur) du groupe' });
            }
            const botIsAdmin = await checkBotAdmin(sock, from);
            if (!botIsAdmin) {
                return await sock.sendMessage(from, { text: '❌ Je dois être admin pour bannir' });
            }

            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned && mentioned[0] ? mentioned[0] : (msg.message?.extendedTextMessage?.contextInfo?.participant);

            if (!target) return await sock.sendMessage(from, { text: '❌ Mentionne ou réponds à la personne à bannir: .ban @user' });

            await sock.groupParticipantsUpdate(from, [target], 'remove');
            await sock.sendMessage(from, { text: `🔨 @${target.split('@')[0]} a été banni du groupe`, mentions: [target] });
        } catch (error) {
            console.error('Erreur ban:', error);
            await sock.sendMessage(from, { text: '❌ Erreur lors du bannissement' });
        }
    }
};
