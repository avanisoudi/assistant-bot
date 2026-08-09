module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned && mentioned[0] ? mentioned[0] : (msg.message?.extendedTextMessage?.contextInfo?.participant);
            if (!target) return await sock.sendMessage(from, { text: '❌ Mentionne la personne: .block @user' });

            await sock.updateBlockStatus(target, 'block');
            await sock.sendMessage(from, { text: `🚫 @${target.split('@')[0]} a été bloqué`, mentions: [target] });
        } catch (error) {
            console.error('Erreur block:', error);
            await sock.sendMessage(from, { text: '❌ Erreur lors du blocage' });
        }
    }
};
