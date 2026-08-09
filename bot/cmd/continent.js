const axios = require('axios');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🌍 .continent <pays>\nExemple: .continent Brazil' });
            const country = args.join(' ');
            const res = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fields=name,continents,region,subregion`, { timeout: 10000 });
            const data = res.data[0];

            await sock.sendMessage(from, {
                text: `🌍 *${data.name.common}*\n\n🗺️ Continent: ${data.continents[0]}\n📍 Région: ${data.region}\n📌 Sous-région: ${data.subregion || 'N/A'}`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Pays introuvable' });
        }
    }
};
