module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Groupe uniquement' });

            const { checkAdmin } = require('../lib/adminCheck');
            const { isAdmin, debug } = await checkAdmin(sock, from, msg);

            if (!isAdmin) {
                console.log('[adminCheck] Refus admin:', JSON.stringify(debug));
                return await sock.sendMessage(from, { text: '❌ Réservé aux admins (ou créateur) du groupe' });
            }
            if (args.length === 0) return await sock.sendMessage(from, { text: '❌ .add <numéro> (ex: .add 221771234567)' });

            const number = args[0].replace(/[^0-9]/g, '');
            const target = `${number}@s.whatsapp.net`;

            await sock.groupParticipantsUpdate(from, [target], 'add');
            await sock.sendMessage(from, { text: `✅ ${number} a été ajouté au groupe` });
        } catch (error) {
            console.error('Erreur add:', error);
            await sock.sendMessage(from, { text: '❌ Impossible d\'ajouter (numéro invalide ou confidentialité)' });
        }
    }
};
