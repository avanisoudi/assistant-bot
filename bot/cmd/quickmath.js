module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length > 0 && /^-?\d+$/.test(args[0]) && global.lastMath && global.lastMath[from] !== undefined) {
                const correct = global.lastMath[from];
                const guess = parseInt(args[0]);
                delete global.lastMath[from];
                if (guess === correct) {
                    return await sock.sendMessage(from, { text: `✅ Correct! La réponse était ${correct}` });
                }
                return await sock.sendMessage(from, { text: `❌ Faux! La bonne réponse était ${correct}` });
            }

            const a = Math.floor(Math.random() * 50) + 1;
            const b = Math.floor(Math.random() * 50) + 1;
            const ops = ['+', '-', '*'];
            const op = ops[Math.floor(Math.random() * ops.length)];
            const result = op === '+' ? a + b : op === '-' ? a - b : a * b;

            if (!global.lastMath) global.lastMath = {};
            global.lastMath[from] = result;

            await sock.sendMessage(from, { text: `🧮 *CALCUL RAPIDE*\n\n${a} ${op} ${b} = ?\n\nRéponds avec: .quickmath <ta réponse>` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
