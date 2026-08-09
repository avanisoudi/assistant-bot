module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const n = parseInt(args[0]) || 10;
            if (n < 1 || n > 50) return await sock.sendMessage(from, { text: '🔢 .fibonacci <nombre de termes, max 50>' });
            const seq = [0, 1];
            for (let i = 2; i < n; i++) seq.push(seq[i-1] + seq[i-2]);
            await sock.sendMessage(from, { text: `🔢 *SUITE DE FIBONACCI* (${n} termes)\n\n${seq.slice(0, n).join(', ')}` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
