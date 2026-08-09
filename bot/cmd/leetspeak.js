const LEET_MAP = { a: '4', e: '3', i: '1', o: '0', s: '5', t: '7', g: '9', b: '8' };
module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🕹️ .leetspeak <texte>' });
            const text = args.join(' ').toLowerCase().split('').map(c => LEET_MAP[c] || c).join('');
            await sock.sendMessage(from, { text: `🕹️ ${text}` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
