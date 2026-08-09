const { checkAdmin } = require('../lib/adminCheck');
const { getGroupSettings, setGroupSetting } = require('../lib/db');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Groupe seulement' });

            if (args[0] === 'set') {
                const { isAdmin } = await checkAdmin(sock, from, msg);
                if (!isAdmin) return await sock.sendMessage(from, { text: '❌ Réservé aux admins (ou créateur) du groupe' });

                const text = args.slice(1).join(' ');
                if (!text) return await sock.sendMessage(from, { text: '❌ .rules set <texte du règlement>' });

                setGroupSetting(from, 'rules', text);
                return await sock.sendMessage(from, { text: '✅ Règlement du groupe mis à jour !' });
            }

            const settings = getGroupSettings(from);
            if (!settings.rules) {
                return await sock.sendMessage(from, { text: '📜 Aucun règlement défini pour ce groupe.\n\nUn admin peut en définir un avec: .rules set <texte>' });
            }
            await sock.sendMessage(from, { text: `📜 *RÈGLEMENT DU GROUPE*\n\n${settings.rules}` });
        } catch (error) {
            console.error('Erreur rules:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
