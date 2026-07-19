module.exports = {
    execute: async (sock, msg, from, args) => {
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ Groupe uniquement !" });
        }

        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants
            .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
            .map(p => p.id);

        const message = args.length > 0
            ? `🚨 *MESSAGE AUX ADMINS*\n\n${args.join(' ')}`
            : `🚨 *TAG DES ADMINS*`;

        let text = message + '\n\n';
        admins.forEach((admin, i) => {
            text += `👑 @${admin.split('@')[0]}\n`;
        });

        sock.sendMessage(from, {
            text: text,
            mentions: admins
        });
    }
};
