const { checkAdmin } = require('../lib/adminCheck');
const { getGroupSettings, setGroupSetting } = require('../lib/db');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Groupe seulement' });
            const { isAdmin } = await checkAdmin(sock, from, msg);
            if (!isAdmin) return await sock.sendMessage(from, { text: '❌ Réservé aux admins (ou créateur) du groupe' });

            const option = args[0]?.toLowerCase();
            if (option === 'on') {
                setGroupSetting(from, 'antiviewonce', true);
                return await sock.sendMessage(from, { text: '👁️ *Anti vue-unique activé !*\nLes photos/vidéos "vue unique" envoyées seront republiées normalement.' });
            } else if (option === 'off') {
                setGroupSetting(from, 'antiviewonce', false);
                return await sock.sendMessage(from, { text: '👁️ Anti vue-unique désactivé.' });
            }
            const settings = getGroupSettings(from);
            const status = settings.antiviewonce ? '✅ Activé' : '❌ Désactivé';
            await sock.sendMessage(from, { text: `👁️ *Anti vue-unique :* ${status}\n\nUsage: .antiviewonce on/off` });
        } catch (error) {
            console.error('Erreur antiviewonce:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
