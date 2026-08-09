module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            let user1, user2;

            if (mentioned && mentioned.length >= 2) {
                [user1, user2] = mentioned;
            } else if (mentioned && mentioned.length === 1) {
                user1 = msg.key.participant || msg.key.remoteJid;
                user2 = mentioned[0];
            } else {
                return await sock.sendMessage(from, { text: '💕 .ship @user1 @user2 (ou .ship @user pour te shipper avec)' });
            }

            const name1 = user1.split('@')[0];
            const name2 = user2.split('@')[0];
            const shipName = name1.slice(0, Math.ceil(name1.length / 2)) + name2.slice(Math.floor(name2.length / 2));
            const score = Math.floor(Math.random() * 101);

            const bar = '💗'.repeat(Math.round(score / 10)) + '🖤'.repeat(10 - Math.round(score / 10));
            const verdict = score >= 80 ? "C'est le grand amour ! 💍" : score >= 50 ? "Il y a du potentiel ! 😊" : score >= 20 ? "Amis avant tout 🤝" : "Ça sent le clash 😅";

            await sock.sendMessage(from, {
                text: `💘 *SHIP*\n\n@${name1} 🔗 @${name2}\n\n✨ Nom du couple: *${shipName}*\n${bar}\n📊 Compatibilité: ${score}%\n\n${verdict}`,
                mentions: [user1, user2]
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
