const axios = require('axios');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🌍 .country <nom>\nExemple: .country Germany' });
            const country = args.join(' ');
            const res = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fields=name,capital,region,population,languages,flag,area`, { timeout: 10000 });
            const data = res.data[0];
            const langs = data.languages ? Object.values(data.languages).join(', ') : 'N/A';

            await sock.sendMessage(from, {
                text: `${data.flag} *${data.name.common}*\n\n🏙️ Capitale: ${data.capital ? data.capital[0] : 'N/A'}\n🌍 Région: ${data.region}\n👥 Population: ${data.population.toLocaleString()}\n📏 Superficie: ${data.area.toLocaleString()} km²\n🗣️ Langues: ${langs}`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Pays introuvable. Essaie en anglais (ex: France, Japan, Brazil)' });
        }
    }
};
