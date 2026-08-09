module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '❌ .song <titre>' });
            
            const song = args.join(' ');
            
            await sock.sendMessage(from, {
                text: `🎵 *CHANSON: ${song}*\n\n🎤 Artiste: Inconnu\n📅 Année: 2023\n⏱️ Durée: 3:45\n💿 Album: Best Of\n⭐ Hits: 1M+`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
