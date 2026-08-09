const axios = require('axios');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const res = await axios.get('https://restcountries.com/v3.1/all?fields=name,capital,region,flag,population', { timeout: 10000 });
            const countries = res.data;
            const data = countries[Math.floor(Math.random() * countries.length)];

            await sock.sendMessage(from, {
                text: `🎲 *PAYS ALÉATOIRE*\n\n${data.flag} ${data.name.common}\n🏙️ Capitale: ${data.capital ? data.capital[0] : 'N/A'}\n🌍 Région: ${data.region}\n👥 Population: ${data.population.toLocaleString()}`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur de connexion au service' });
        }
    }
};
