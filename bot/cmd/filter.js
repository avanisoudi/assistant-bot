const { checkAdmin } = require('../lib/adminCheck');
const { getGroupSettings, setGroupSetting } = require('../lib/db');

module.exports = {
    execute: async (sock, msg, from, args) => {
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: "❌ Groupe uniquement !" });
        const settings = getGroupSettings(from);

        if (args.length === 0) {
            return await sock.sendMessage(from, {
                text: `🔍 *Filtres Mots*\n\nFiltres actuels: ${(settings.filters || []).length}\n\n.filter add <mot> - Ajouter\n.filter remove <mot> - Retirer\n.filter list - Lister`
            });
        }

        const { isAdmin, debug } = await checkAdmin(sock, from, msg);
        if (!isAdmin) {
            console.log('[adminCheck] Refus admin:', JSON.stringify(debug));
            return sock.sendMessage(from, { text: "❌ Tu dois être admin (ou créateur) du groupe !" });
        }

        const action = args[0];
        const filters = settings.filters || [];

        if (action === 'add' && args[1]) {
            filters.push(args[1].toLowerCase());
            setGroupSetting(from, 'filters', filters);
            await sock.sendMessage(from, { text: `✅ Mot filtré ajouté: ${args[1]}` });
        } else if (action === 'remove' && args[1]) {
            const idx = filters.indexOf(args[1].toLowerCase());
            if (idx === -1) return await sock.sendMessage(from, { text: `❌ "${args[1]}" n'est pas dans la liste` });
            filters.splice(idx, 1);
            setGroupSetting(from, 'filters', filters);
            await sock.sendMessage(from, { text: `✅ Retiré: ${args[1]}` });
        } else if (action === 'list') {
            await sock.sendMessage(from, { text: `📝 Filtres: ${filters.join(', ') || 'Aucun'}` });
        }
    }
};
