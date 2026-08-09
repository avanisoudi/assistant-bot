module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length < 2) return await sock.sendMessage(from, { text: '📏 .kmmiles <valeur> <km2mi/mi2km>' });
            const value = parseFloat(args[0]);
            const dir = args[1].toLowerCase();
            if (isNaN(value)) return await sock.sendMessage(from, { text: '❌ Valeur invalide' });
            if (dir === 'km2mi') {
                await sock.sendMessage(from, { text: `📏 ${value} km = *${(value * 0.621371).toFixed(2)} miles*` });
            } else if (dir === 'mi2km') {
                await sock.sendMessage(from, { text: `📏 ${value} miles = *${(value * 1.60934).toFixed(2)} km*` });
            } else {
                await sock.sendMessage(from, { text: '❌ Utilise km2mi ou mi2km' });
            }
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
