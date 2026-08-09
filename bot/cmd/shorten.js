const axios = require('axios');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🔗 .shorten <url>' });
            const url = args[0];
            if (!/^https?:\/\//.test(url)) return await sock.sendMessage(from, { text: '❌ L\'URL doit commencer par http:// ou https://' });

            const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, { timeout: 10000 });
            await sock.sendMessage(from, { text: `🔗 *URL RACCOURCIE*\n\n${res.data}` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur lors du raccourcissement (service temporairement indisponible)' });
        }
    }
};
