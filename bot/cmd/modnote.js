const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'modnotes.json');

function loadDB() {
    try { return fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf-8')) : {}; } catch { return {}; }
}
function saveDB(d) { fs.writeFileSync(dbPath, JSON.stringify(d, null, 2)); }

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned && mentioned[0] ? mentioned[0] : (msg.message?.extendedTextMessage?.contextInfo?.participant);

            if (!target) {
                return await sock.sendMessage(from, { text: '📝 .modnote @user <note>\n.modnote list @user → voir les notes' });
            }

            if (args[0] === 'list') {
                const db = loadDB();
                const notes = db[target] || [];
                const text = notes.length ? notes.map((n, i) => `${i + 1}. ${n}`).join('\n') : 'Aucune note';
                return await sock.sendMessage(from, { text: `📝 Notes pour @${target.split('@')[0]}:\n\n${text}`, mentions: [target] });
            }

            const note = args.slice(1).join(' ');
            if (!note) return await sock.sendMessage(from, { text: '❌ Écris une note: .modnote @user <texte>' });

            const db = loadDB();
            if (!db[target]) db[target] = [];
            db[target].push(note);
            saveDB(db);

            await sock.sendMessage(from, { text: `✅ Note ajoutée pour @${target.split('@')[0]}`, mentions: [target] });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
