if (!global.numberGuessGame) global.numberGuessGame = {};

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length > 0 && global.numberGuessGame[from]) {
                const guess = parseInt(args[0]);
                const game = global.numberGuessGame[from];
                if (isNaN(guess)) return await sock.sendMessage(from, { text: '❌ Donne un nombre valide' });

                game.tries++;
                if (guess === game.number) {
                    delete global.numberGuessGame[from];
                    return await sock.sendMessage(from, { text: `🎉 Bravo ! C'était bien ${game.number} (trouvé en ${game.tries} essai(s))` });
                }
                if (game.tries >= game.maxTries) {
                    const number = game.number;
                    delete global.numberGuessGame[from];
                    return await sock.sendMessage(from, { text: `💀 Perdu ! Le nombre était ${number}` });
                }
                const hint = guess < game.number ? '⬆️ Plus grand !' : '⬇️ Plus petit !';
                return await sock.sendMessage(from, { text: `${hint} (essai ${game.tries}/${game.maxTries})` });
            }

            const number = Math.floor(Math.random() * 100) + 1;
            global.numberGuessGame[from] = { number, tries: 0, maxTries: 7 };
            await sock.sendMessage(from, { text: `🔢 *DEVINE LE NOMBRE*\n\nJ'ai choisi un nombre entre 1 et 100 !\n💡 Tu as 7 essais: .numberguess <nombre>` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
