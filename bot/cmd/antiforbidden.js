const { checkAdmin } = require('../lib/adminCheck');
const { getGroupSettings, setGroupSetting } = require('../lib/db');
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'groups.json');

function saveWords(from, words) {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    if (!db[from]) db[from] = {};
    db[from].forbiddenWords = words;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

module.exports = {
    execute: async (sock, msg, from, args) => {
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: "❌ Groupe uniquement !" });

        const { isAdmin, debug } = await checkAdmin(sock, from, msg);
        if (!isAdmin) {
            console.log('[adminCheck] Refus admin:', JSON.stringify(debug));
            return sock.sendMessage(from, { text: "❌ Tu dois être admin (ou créateur) du groupe !" });
        }

        const option = args[0]?.toLowerCase();
        const settings = getGroupSettings(from);

        if (option === 'on') {
            setGroupSetting(from, 'antiforbidden', true);
            return sock.sendMessage(from, { text: "🚯 *Antiforbidden activé !*\nUtilise .antiforbidden add <mot> pour ajouter des mots interdits." });
        } else if (option === 'off') {
            setGroupSetting(from, 'antiforbidden', false);
            return sock.sendMessage(from, { text: "🚯 *Antiforbidden désactivé.*" });
        } else if (option === 'add' && args[1]) {
            const words = settings.forbiddenWords || [];
            words.push(args[1].toLowerCase());
            saveWords(from, words);
            return sock.sendMessage(from, { text: `✅ Mot interdit ajouté: ${args[1]}` });
        } else if (option === 'list') {
            return sock.sendMessage(from, { text: `🚯 Mots interdits: ${(settings.forbiddenWords || []).join(', ') || 'Aucun'}` });
        } else {
            const status = settings.antiforbidden ? "✅ Activé" : "❌ Désactivé";
            return sock.sendMessage(from, { text: `🚯 *Antiforbidden :* ${status}\n\n.antiforbidden on/off\n.antiforbidden add <mot>\n.antiforbidden list` });
        }
    }
};
