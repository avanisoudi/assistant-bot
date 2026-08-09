const { checkAdmin } = require('../lib/adminCheck');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Groupe seulement' });
            const { isAdmin } = await checkAdmin(sock, from, msg);
            if (!isAdmin) return await sock.sendMessage(from, { text: '❌ Réservé aux admins (ou créateur) du groupe' });

            const minutes = parseInt(args[0]);
            const text = args.slice(1).join(' ');
            if (!minutes || minutes <= 0 || minutes > 1440 || !text) {
                return await sock.sendMessage(from, { text: '📅 .schedule <minutes> <message>\nExemple: .schedule 60 Réunion dans 1h!\n\n⚠️ Si le bot redémarre avant l\'envoi, le message programmé est perdu.' });
            }

            await sock.sendMessage(from, { text: `📅 Message programmé dans ${minutes} min` });

            setTimeout(async () => {
                try {
                    await sock.sendMessage(from, { text: `📅 *MESSAGE PROGRAMMÉ*\n\n${text}` });
                } catch (e) { console.error('Erreur envoi schedule:', e); }
            }, minutes * 60 * 1000);
        } catch (error) {
            console.error('Erreur schedule:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
