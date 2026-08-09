module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Groupe uniquement' });

            const { checkAdmin, checkBotAdmin } = require('../lib/adminCheck');
            const { isAdmin, debug } = await checkAdmin(sock, from, msg);
            const botIsAdmin = await checkBotAdmin(sock, from);

            if (!isAdmin) {
                console.log('[adminCheck] Refus admin:', JSON.stringify(debug));
                return await sock.sendMessage(from, { text: '❌ Réservé aux admins (ou créateur) du groupe' });
            }
            if (!botIsAdmin) return await sock.sendMessage(from, { text: '❌ Je dois être admin pour faire ça' });

            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
            const target = (mentioned && mentioned[0]) || quoted;

            // .kick +239 → expulse tous les membres dont le numéro commence par cet indicatif
            if (!target && args[0]?.startsWith('+') && /^\+\d+$/.test(args[0])) {
                const countryCode = args[0].slice(1);
                const metadata = await sock.groupMetadata(from);
                const toKick = metadata.participants
                    .filter(p => p.id.split('@')[0].startsWith(countryCode))
                    .filter(p => !(p.admin === 'admin' || p.admin === 'superadmin')) // ne touche jamais aux admins
                    .map(p => p.id);

                if (toKick.length === 0) return await sock.sendMessage(from, { text: `❌ Aucun membre non-admin trouvé avec l'indicatif ${args[0]}` });

                await sock.groupParticipantsUpdate(from, toKick, 'remove');
                return await sock.sendMessage(from, { text: `👢 ${toKick.length} membre(s) avec l'indicatif ${args[0]} expulsé(s)` });
            }

            if (!target) return await sock.sendMessage(from, { text: '❌ Mentionnez, répondez à la personne, ou utilisez .kick +<indicatif pays>' });

            await sock.groupParticipantsUpdate(from, [target], 'remove');
            await sock.sendMessage(from, {
                text: `👢 @${target.split('@')[0]} a été expulsé du groupe`,
                mentions: [target]
            });
        } catch (error) {
            console.error('Erreur kick:', error);
            await sock.sendMessage(from, { text: '❌ Erreur lors de l\'expulsion' });
        }
    }
};
