module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const n = parseInt(args[0]);
            if (!args[0] || isNaN(n) || n < 0) return await sock.sendMessage(from, { text: '🔢 .factorial <nombre entier positif>' });
            if (n > 170) return await sock.sendMessage(from, { text: '❌ Nombre trop grand (max 170)' });
            let result = BigInt(1);
            for (let i = 2; i <= n; i++) result *= BigInt(i);
            await sock.sendMessage(from, { text: `🔢 ${n}! = ${result.toString()}` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
