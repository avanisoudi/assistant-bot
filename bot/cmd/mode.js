const { checkAdmin } = require('../lib/adminCheck');
const { getGroupSettings, setGroupSetting } = require('../lib/db');

module.exports = {
    execute: async (sock, msg, from, args) => {
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: "❌ Groupe uniquement !" });
        const settings = getGroupSettings(from);

        if (args.length === 0) {
            return await sock.sendMessage(from, {
                text: `⚙️ *Mode Groupe*\n\nMode actuel: ${settings.mode.toUpperCase()}\n\n.mode private - Mode privé (Admins seulement)\n.mode public - Mode public (Tous)`
            });
        }

        const { isAdmin, debug } = await checkAdmin(sock, from, msg);
        if (!isAdmin) {
            console.log('[adminCheck] Refus admin:', JSON.stringify(debug));
            return sock.sendMessage(from, { text: "❌ Tu dois être admin (ou créateur) du groupe !" });
        }

        const newMode = args[0].toLowerCase();
        if (newMode === 'private' || newMode === 'public') {
            setGroupSetting(from, 'mode', newMode);
            await sock.sendMessage(from, { text: `✅ Mode changé en *${newMode.toUpperCase()}*` });
        } else {
            await sock.sendMessage(from, { text: '❌ Utilisez: private ou public' });
        }
    }
};
