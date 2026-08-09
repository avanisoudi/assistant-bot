const axios = require('axios');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const res = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en', { timeout: 10000 });
            const fact = res.data?.text || "Impossible de récupérer un fait pour le moment.";
            await sock.sendMessage(from, { text: `🧠 *LE SAVAIS-TU ?*\n\n${fact}\n\n_(fait en anglais, traduction non garantie)_` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur lors de la récupération du fait' });
        }
    }
};
