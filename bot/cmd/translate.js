const axios = require('axios');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '❌ .translate <texte>\n\n💡 Pour choisir la langue cible, utilise .trt <texte> <code langue>' });

            const text = args.join(' ');

            const response = await axios.get('https://api.mymemory.translated.net/get', {
                params: { q: text, langpair: 'autodetect|en' },
                timeout: 10000
            });

            if (response.data?.responseStatus !== 200 || !response.data?.responseData?.translatedText) {
                console.error('Erreur translate - réponse API:', JSON.stringify(response.data));
                return await sock.sendMessage(from, { text: '❌ Traduction indisponible pour le moment' });
            }

            const translated = response.data.responseData.translatedText;
            await sock.sendMessage(from, { text: `🌐 *TRADUCTION*\n\n📝 ${text}\n\n🔤 EN: ${translated}` });
        } catch (error) {
            console.error('Erreur translate:', error.message);
            await sock.sendMessage(from, { text: '❌ Erreur lors de la traduction' });
        }
    }
};
