const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'votekick.json');
const VOTES_NEEDED = 3;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function loadDB() { try { return fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf-8')) : {}; } catch { return {}; } }
function saveDB(d) { fs.writeFileSync(dbPath, JSON.stringify(d, null, 2)); }

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Groupe seulement' });

            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned && mentioned[0];
            if (!target) return await sock.sendMessage(from, { text: '🗳️ .votekick @user\n\nSi 3 membres différents votent en moins de 10 minutes, la personne est expulsée.' });

            const sender = msg.key.participant || msg.key.remoteJid;
            if (target === sender) return await sock.sendMessage(from, { text: '❌ Tu ne peux pas voter contre toi-même' });

            const db = loadDB();
            const key = `${from}_${target}`;
            const now = Date.now();

            if (!db[key] || (now - db[key].startedAt) > WINDOW_MS) {
                db[key] = { startedAt: now, voters: [] };
            }

            if (db[key].voters.includes(sender)) {
                saveDB(db);
                return await sock.sendMessage(from, { text: `⚠️ Tu as déjà voté contre @${target.split('@')[0]} (${db[key].voters.length}/${VOTES_NEEDED})`, mentions: [target] });
            }

            db[key].voters.push(sender);
            const count = db[key].voters.length;

            if (count >= VOTES_NEEDED) {
                delete db[key];
                saveDB(db);
                try {
                    await sock.groupParticipantsUpdate(from, [target], 'remove');
                    return await sock.sendMessage(from, { text: `🔨 @${target.split('@')[0]} expulsé (vote communautaire: ${VOTES_NEEDED}/${VOTES_NEEDED})`, mentions: [target] });
                } catch (e) {
                    return await sock.sendMessage(from, { text: `❌ Vote atteint mais je dois être admin pour expulser` });
                }
            }

            saveDB(db);
            await sock.sendMessage(from, { text: `🗳️ Vote enregistré contre @${target.split('@')[0]} (${count}/${VOTES_NEEDED})`, mentions: [target] });
        } catch (error) {
            console.error('Erreur votekick:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
