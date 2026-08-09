module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length < 2) return await sock.sendMessage(from, { text: '⚖️ .kglbs <valeur> <kg2lb/lb2kg>' });
            const value = parseFloat(args[0]);
            const dir = args[1].toLowerCase();
            if (isNaN(value)) return await sock.sendMessage(from, { text: '❌ Valeur invalide' });
            if (dir === 'kg2lb') {
                await sock.sendMessage(from, { text: `⚖️ ${value} kg = *${(value * 2.20462).toFixed(2)} lbs*` });
            } else if (dir === 'lb2kg') {
                await sock.sendMessage(from, { text: `⚖️ ${value} lbs = *${(value / 2.20462).toFixed(2)} kg*` });
            } else {
                await sock.sendMessage(from, { text: '❌ Utilise kg2lb ou lb2kg' });
            }
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
