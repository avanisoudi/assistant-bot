module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const min = parseInt(args[0]) || 1;
            const max = parseInt(args[1]) || 100;
            if (min >= max) return await sock.sendMessage(from, { text: '❌ Le min doit être inférieur au max' });
            const result = Math.floor(Math.random() * (max - min + 1)) + min;
            await sock.sendMessage(from, { text: `🎲 Nombre aléatoire entre ${min} et ${max}: *${result}*` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
