module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length < 2) return await sock.sendMessage(from, { text: '📊 .percentage <nombre> <pourcentage>\nExemple: .percentage 200 15 → 15% de 200' });
            const num = parseFloat(args[0]);
            const pct = parseFloat(args[1]);
            if (isNaN(num) || isNaN(pct)) return await sock.sendMessage(from, { text: '❌ Nombres invalides' });
            await sock.sendMessage(from, { text: `📊 ${pct}% de ${num} = *${(num * pct / 100).toFixed(2)}*` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
