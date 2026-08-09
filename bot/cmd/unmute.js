const { checkAdmin } = require('../lib/adminCheck');
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'groups.json');

function loadDB() {
    try { return fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf-8')) : {}; } catch { return {}; }
}
function saveDB(d) { fs.writeFileSync(dbPath, JSON.stringify(d, null, 2)); }

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Groupe seulement' });
            const { isAdmin, debug } = await checkAdmin(sock, from, msg);
            if (!isAdmin) {
                console.log('[adminCheck] Refus admin:', JSON.stringify(debug));
                return sock.sendMessage(from, { text: "❌ Tu dois être admin (ou créateur) du groupe !" });
            }

            await sock.groupSettingUpdate(from, 'not_announcement');

            const db = loadDB();
            if (!db[from]) db[from] = {};
            db[from].muted = false;
            saveDB(db);

            await sock.sendMessage(from, { text: '🔊 Groupe réouvert, tout le monde peut écrire' });
        } catch (error) {
            console.error('Erreur unmute:', error);
            await sock.sendMessage(from, { text: '❌ Erreur - vérifie que le bot est admin' });
        }
    }
};
