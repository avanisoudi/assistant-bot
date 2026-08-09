const axios = require('axios');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length < 3) return await sock.sendMessage(from, { text: '💱 .exchange <montant> <de> <vers>\nExemple: .exchange 100 USD EUR' });
            const amount = parseFloat(args[0]);
            const from_curr = args[1].toUpperCase();
            const to_curr = args[2].toUpperCase();
            if (isNaN(amount)) return await sock.sendMessage(from, { text: '❌ Montant invalide' });

            const res = await axios.get(`https://api.frankfurter.app/latest?amount=${amount}&from=${from_curr}&to=${to_curr}`, { timeout: 10000 });
            const result = res.data.rates[to_curr];

            if (result === undefined) return await sock.sendMessage(from, { text: '❌ Devise non reconnue (utilise les codes ISO: USD, EUR, GBP, JPY...)' });

            await sock.sendMessage(from, {
                text: `💱 *CONVERSION*\n\n${amount} ${from_curr} = *${result.toFixed(2)} ${to_curr}*\n\n📅 Taux du ${res.data.date}`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur (devise non reconnue ou service indisponible)' });
        }
    }
};
