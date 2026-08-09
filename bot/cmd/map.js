const COORDS = {
    'paris': [48.8566, 2.3522], 'london': [51.5074, -0.1278], 'newyork': [40.7128, -74.0060],
    'tokyo': [35.6762, 139.6503], 'dubai': [25.2048, 55.2708], 'abidjan': [5.3600, -4.0083],
    'douala': [4.0511, 9.7679], 'dakar': [14.7167, -17.4677], 'kinshasa': [-4.4419, 15.2663],
    'casablanca': [33.5731, -7.5898], 'lagos': [6.5244, 3.3792], 'yaounde': [3.8480, 11.5021],
    'bamako': [12.6392, -8.0029], 'lome': [6.1725, 1.2314], 'cotonou': [6.3703, 2.3912]
};

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) {
                return await sock.sendMessage(from, { text: `🗺️ .map <ville>\n\nVilles: ${Object.keys(COORDS).join(', ')}` });
            }
            const city = args.join(' ').toLowerCase().replace(/\s/g, '');
            const coords = COORDS[city];
            if (!coords) return await sock.sendMessage(from, { text: `❌ Ville inconnue. Dispo: ${Object.keys(COORDS).join(', ')}` });

            const [lat, lon] = coords;
            const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=12&size=600x400&markers=${lat},${lon},red-pushpin`;

            await sock.sendMessage(from, {
                image: { url: mapUrl },
                caption: `🗺️ *${args.join(' ')}*\n📍 ${lat}, ${lon}\n\n🔗 https://www.google.com/maps?q=${lat},${lon}`
            });
        } catch (error) {
            console.error('Erreur map:', error);
            await sock.sendMessage(from, { text: '❌ Erreur lors de la génération de la carte' });
        }
    }
};
