const { checkAdmin, checkBotAdmin } = require('../lib/adminCheck');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Groupe uniquement' });

            const { isAdmin } = await checkAdmin(sock, from, msg);
            if (!isAdmin) return await sock.sendMessage(from, { text: '❌ Réservé aux admins (ou créateur) du groupe' });
            const botIsAdmin = await checkBotAdmin(sock, from);
            if (!botIsAdmin) return await sock.sendMessage(from, { text: '❌ Je dois être admin pour faire ça' });

            if (args[0] !== 'confirm') {
                const metadata = await sock.groupMetadata(from);
                const nonAdminCount = metadata.participants.filter(p => !(p.admin === 'admin' || p.admin === 'superadmin')).length;
                return await sock.sendMessage(from, {
                    text: `⚠️ *ATTENTION*\n\nCeci va expulser les ${nonAdminCount} membres non-admins du groupe.\n\nPour confirmer : .kickall confirm`
                });
            }

            const metadata = await sock.groupMetadata(from);
            const sender = msg.key.participant || msg.key.remoteJid;
            const toKick = metadata.participants
                .filter(p => !(p.admin === 'admin' || p.admin === 'superadmin'))
                .filter(p => p.id !== sender)
                .map(p => p.id);

            if (toKick.length === 0) return await sock.sendMessage(from, { text: '❌ Aucun membre non-admin à expulser' });

            await sock.sendMessage(from, { text: `⏳ Expulsion de ${toKick.length} membre(s) en cours...` });

            // Expulsion par petits lots pour éviter les limites/erreurs de l'API WhatsApp
            let kicked = 0;
            for (let i = 0; i < toKick.length; i += 5) {
                const batch = toKick.slice(i, i + 5);
                try {
                    await sock.groupParticipantsUpdate(from, batch, 'remove');
                    kicked += batch.length;
                } catch (e) { console.error('Erreur batch kickall:', e); }
            }

            await sock.sendMessage(from, { text: `👢 ${kicked} membre(s) expulsé(s)` });
        } catch (error) {
            console.error('Erreur kickall:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
