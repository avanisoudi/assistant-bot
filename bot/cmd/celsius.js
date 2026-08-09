module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length < 2) return await sock.sendMessage(from, { text: '🌡️ .celsius <valeur> <c2f/f2c>\nExemple: .celsius 25 c2f' });
            const value = parseFloat(args[0]);
            const dir = args[1].toLowerCase();
            if (isNaN(value)) return await sock.sendMessage(from, { text: '❌ Valeur invalide' });
            if (dir === 'c2f') {
                await sock.sendMessage(from, { text: `🌡️ ${value}°C = *${(value * 9/5 + 32).toFixed(1)}°F*` });
            } else if (dir === 'f2c') {
                await sock.sendMessage(from, { text: `🌡️ ${value}°F = *${((value - 32) * 5/9).toFixed(1)}°C*` });
            } else {
                await sock.sendMessage(from, { text: '❌ Utilise c2f ou f2c' });
            }
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
