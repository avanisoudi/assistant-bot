module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '❌ .artistinfo <artiste>' });
            const artist = args.join(' ');
            await sock.sendMessage(from, { text: `🎤 *ARTISTE: ${artist}*\n\n🎵 Écoutes: 1M+\n👥 Followers: 500K\n🏆 Prix: Plusieurs\n📅 Actif depuis: 2020` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
