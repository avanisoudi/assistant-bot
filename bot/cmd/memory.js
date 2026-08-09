const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'memory.json');

function loadDB() { try { return fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf-8')) : {}; } catch { return {}; } }
function saveDB(d) { fs.writeFileSync(dbPath, JSON.stringify(d, null, 2)); }

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const db = loadDB();

            if (args.length > 0 && db[sender]) {
                const answer = args.join('');
                const correct = db[sender].join('');
                delete db[sender];
                saveDB(db);
                if (answer === correct) {
                    return await sock.sendMessage(from, { text: `🎉 Correct! La séquence était: ${correct}` });
                }
                return await sock.sendMessage(from, { text: `❌ Raté! La séquence était: ${correct} (tu as tapé ${answer})` });
            }

            const length = 5;
            const sequence = Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
            db[sender] = sequence;
            saveDB(db);

            await sock.sendMessage(from, { text: `🧠 *TEST DE MÉMOIRE*\n\nRetiens cette séquence:\n\n*${sequence.join(' ')}*\n\n⏳ Retape-la (sans espaces) dans ta prochaine commande: .memory <séquence>` });
        } catch (error) {
            console.error('Erreur memory:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
