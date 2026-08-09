const axios = require('axios');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🏛️ .capital <pays>\nExemple: .capital France' });
            const country = args.join(' ');
            const res = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fields=name,capital,region`, { timeout: 10000 });
            const data = res.data[0];

            await sock.sendMessage(from, {
                text: `🏛️ *${data.name.common}*\n\n🏙️ Capitale: ${data.capital ? data.capital[0] : 'N/A'}\n🌍 Région: ${data.region}`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Pays introuvable. Vérifie l\'orthographe (en anglais de préférence)' });
        }
    }
};
