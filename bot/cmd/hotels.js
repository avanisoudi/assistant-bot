module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🏨 .hotels <ville>\nExemple: .hotels Douala' });
            const city = args.join(' ');
            const searchUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}`;

            await sock.sendMessage(from, {
                text: `🏨 *HÔTELS À ${city.toUpperCase()}*\n\n🔗 Voir les disponibilités et prix en temps réel:\n${searchUrl}\n\n💡 Astuce: compare aussi sur Hotels.com et Expedia pour les meilleurs prix`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
