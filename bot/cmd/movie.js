module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '❌ .movie <titre>' });
            
            const movie = args.join(' ');
            
            await sock.sendMessage(from, {
                text: `🎬 *FILM: ${movie}*\n\n⭐ Note: 8.5/10\n📅 Année: 2023\n🎭 Genre: Drame\n🕐 Durée: 2h 30m\n👨‍🎬 Réalisateur: Inconnu\n📝 Synopsis: Un film captivant...`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
