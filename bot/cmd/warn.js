const { checkAdmin } = require('../lib/adminCheck');
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'warns.json');

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

            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned && mentioned[0] ? mentioned[0] : (msg.message?.extendedTextMessage?.contextInfo?.participant);
            if (!target) return await sock.sendMessage(from, { text: '❌ Mentionne la personne: .warn @user [raison]' });

            const reason = args.slice(1).join(' ') || 'Non spécifiée';
            const db = loadDB();
            if (!db[from]) db[from] = {};
            if (!db[from][target]) db[from][target] = 0;
            db[from][target]++;
            saveDB(db);

            const count = db[from][target];
            let text = `⚠️ @${target.split('@')[0]} a reçu un avertissement (${count}/3)\n📝 Raison: ${reason}`;

            if (count >= 3) {
                await sock.groupParticipantsUpdate(from, [target], 'remove');
                text += `\n\n🔨 3 avertissements atteints → expulsé automatiquement`;
                db[from][target] = 0;
                saveDB(db);
            }

            await sock.sendMessage(from, { text, mentions: [target] });
        } catch (error) {
            console.error('Erreur warn:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
