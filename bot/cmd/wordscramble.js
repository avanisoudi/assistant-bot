const WORDS = ['ordinateur', 'programmation', 'developpeur', 'telephone', 'internet', 'clavier', 'ecran', 'javascript', 'python', 'whatsapp'];
if (!global.scrambleGame) global.scrambleGame = {};

function scramble(word) {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length > 0 && global.scrambleGame[from]) {
                const guess = args.join('').toLowerCase();
                const correct = global.scrambleGame[from];
                delete global.scrambleGame[from];
                if (guess === correct) return await sock.sendMessage(from, { text: `🎉 Bravo ! C'était bien "${correct}"` });
                return await sock.sendMessage(from, { text: `❌ Raté ! C'était "${correct}"` });
            }

            const word = WORDS[Math.floor(Math.random() * WORDS.length)];
            let scrambled = scramble(word);
            while (scrambled === word) scrambled = scramble(word);
            global.scrambleGame[from] = word;

            await sock.sendMessage(from, { text: `🔤 *MOT MÉLANGÉ*\n\n${scrambled.toUpperCase()}\n\n💡 Retape le mot correct: .wordscramble <mot>` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
