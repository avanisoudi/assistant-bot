const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'hangman.json');

const WORDS = ['ordinateur', 'telephone', 'whatsapp', 'programmation', 'javascript', 'internet', 'clavier', 'ecran', 'python', 'developpeur'];

function loadDB() { try { return fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf-8')) : {}; } catch { return {}; } }
function saveDB(d) { fs.writeFileSync(dbPath, JSON.stringify(d, null, 2)); }

function display(word, guessed) {
    return word.split('').map(l => guessed.includes(l) ? l : '_').join(' ');
}

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const db = loadDB();

            if (!args[0] || args[0] === 'new') {
                const word = WORDS[Math.floor(Math.random() * WORDS.length)];
                db[from] = { word, guessed: [], tries: 6 };
                saveDB(db);
                return await sock.sendMessage(from, {
                    text: `🎪 *PENDU* (nouvelle partie)\n\n${display(word, [])}\n\n💡 ${word.length} lettres | ❤️ 6 essais\n\nPropose une lettre: .hangman <lettre>`
                });
            }

            const game = db[from];
            if (!game) return await sock.sendMessage(from, { text: `❌ Aucune partie en cours. Tape .hangman pour commencer` });

            const letter = args[0].toLowerCase()[0];
            if (game.guessed.includes(letter)) {
                return await sock.sendMessage(from, { text: `⚠️ Tu as déjà proposé "${letter}"\n\n${display(game.word, game.guessed)}` });
            }
            game.guessed.push(letter);

            if (!game.word.includes(letter)) game.tries--;

            const won = game.word.split('').every(l => game.guessed.includes(l));
            const lost = game.tries <= 0;

            if (won) {
                delete db[from];
                saveDB(db);
                return await sock.sendMessage(from, { text: `🎉 *GAGNÉ!* Le mot était "${game.word}"\n\nTape .hangman pour rejouer` });
            }
            if (lost) {
                const word = game.word;
                delete db[from];
                saveDB(db);
                return await sock.sendMessage(from, { text: `💀 *PERDU!* Le mot était "${word}"\n\nTape .hangman pour rejouer` });
            }

            saveDB(db);
            await sock.sendMessage(from, {
                text: `🎪 *PENDU*\n\n${display(game.word, game.guessed)}\n\n❤️ Essais restants: ${game.tries}\n🔤 Lettres essayées: ${game.guessed.join(', ')}`
            });
        } catch (error) {
            console.error('Erreur hangman:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
