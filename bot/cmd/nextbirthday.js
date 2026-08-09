module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🎂 .nextbirthday <JJ/MM>\nExemple: .nextbirthday 15/06' });
            const [day, month] = args[0].split('/').map(Number);
            if (!day || !month) return await sock.sendMessage(from, { text: '❌ Format invalide, utilise JJ/MM' });

            const now = new Date();
            let next = new Date(now.getFullYear(), month - 1, day);
            if (next < now) next = new Date(now.getFullYear() + 1, month - 1, day);

            const days = Math.ceil((next - now) / 86400000);
            await sock.sendMessage(from, { text: `🎂 Il reste *${days} jours* avant ton anniversaire !` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
