module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '⏳ .countdown <JJ/MM/AAAA>\nExemple: .countdown 25/12/2026' });
            const [day, month, year] = args[0].split('/').map(Number);
            if (!day || !month || !year) return await sock.sendMessage(from, { text: '❌ Format invalide, utilise JJ/MM/AAAA' });

            const target = new Date(year, month - 1, day);
            const now = new Date();
            const diffMs = target - now;

            if (diffMs < 0) return await sock.sendMessage(from, { text: '❌ Cette date est déjà passée' });

            const days = Math.floor(diffMs / 86400000);
            const hours = Math.floor((diffMs % 86400000) / 3600000);
            await sock.sendMessage(from, { text: `⏳ *COMPTE À REBOURS*\n\nIl reste *${days} jours* et ${hours}h avant le ${args[0]}` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
