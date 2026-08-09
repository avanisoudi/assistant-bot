const { checkAdmin } = require('../lib/adminCheck');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Groupe seulement' });
            const { isAdmin } = await checkAdmin(sock, from, msg);
            if (!isAdmin) return await sock.sendMessage(from, { text: '❌ Réservé aux admins (ou créateur) du groupe' });

            const text = args.join(' ');
            if (!text) return await sock.sendMessage(from, { text: '❌ .announce <message>' });

            const metadata = await sock.groupMetadata(from);
            const allJids = metadata.participants.map(p => p.id);

            const styled = `╭━━━━━━━━━━━━━━━━━━━╮\n┃   📢 *ANNONCE*  ┃\n╰━━━━━━━━━━━━━━━━━━━╯\n\n${text}\n\n_Message officiel des admins_`;

            await sock.sendMessage(from, { text: styled, mentions: allJids });
        } catch (error) {
            console.error('Erreur announce:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
