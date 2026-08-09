module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '❌ .sports <équipe>' });
            const team = args.join(' ');
            await sock.sendMessage(from, { text: `⚽ *${team}*\n\n📊 Victoires: 10\n📊 Défaites: 5\n⭐ Points: 30\n🏆 Classement: 3e` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
