module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;
            
            if (participants.length < 2) return await sock.sendMessage(from, { text: '❌ Besoin d\'au moins 2 personnes' });
            
            const person1 = participants[Math.floor(Math.random() * participants.length)];
            const person2 = participants[Math.floor(Math.random() * participants.length)];
            
            const score = Math.floor(Math.random() * 100);
            
            await sock.sendMessage(from, {
                text: `💑 *COUPLE ALÉATOIRE*\n\n@${person1.id.split('@')[0]} ❤️ @${person2.id.split('@')[0]}\n\n❤️ Compatibilité: ${score}%`,
                mentions: [person1.id, person2.id]
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
