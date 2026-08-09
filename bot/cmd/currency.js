const axios = require('axios');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '💱 .currency <pays>\nExemple: .currency Japan' });
            const country = args.join(' ');
            const res = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fields=name,currencies`, { timeout: 10000 });
            const data = res.data[0];
            const curr = data.currencies ? Object.entries(data.currencies)[0] : null;

            if (!curr) return await sock.sendMessage(from, { text: '❌ Devise introuvable' });

            await sock.sendMessage(from, {
                text: `💱 *${data.name.common}*\n\n💰 Devise: ${curr[1].name}\n🔤 Code: ${curr[0]}\n💲 Symbole: ${curr[1].symbol || 'N/A'}`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Pays introuvable' });
        }
    }
};
