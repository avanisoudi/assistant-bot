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
            const { isAdmin, senderJid, debug } = await checkAdmin(sock, from, msg);
            if (!isAdmin) {
                console.log('[adminCheck] Refus admin:', JSON.stringify(debug));
                return sock.sendMessage(from, { text: "❌ Tu dois être admin (ou créateur) du groupe !" });
            }

            const seconds = parseInt(args[0]);
            if (!seconds || seconds < 0) {
                return await sock.sendMessage(from, { text: '⏱️ .slowmode <secondes>\n\nExemple: .slowmode 10 → 1 message toutes les 10s par personne\n.slowmode 0 → désactiver' });
            }

            const db = loadDB();
            if (!db[from]) db[from] = {};
            db[from].slowmode = seconds;
            saveDB(db);

            await sock.sendMessage(from, {
                text: seconds === 0 ? '✅ Slowmode désactivé' : `⏱️ Slowmode activé: 1 message toutes les ${seconds}s par personne`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
