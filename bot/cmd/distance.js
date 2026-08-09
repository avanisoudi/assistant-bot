const CITIES = {
    'paris': [48.8566, 2.3522], 'london': [51.5074, -0.1278], 'newyork': [40.7128, -74.0060],
    'tokyo': [35.6762, 139.6503], 'dubai': [25.2048, 55.2708], 'abidjan': [5.3600, -4.0083],
    'douala': [4.0511, 9.7679], 'dakar': [14.7167, -17.4677], 'kinshasa': [-4.4419, 15.2663],
    'casablanca': [33.5731, -7.5898], 'lagos': [6.5244, 3.3792], 'moscow': [55.7558, 37.6173],
    'sydney': [-33.8688, 151.2093], 'losangeles': [34.0522, -118.2437], 'yaounde': [3.8480, 11.5021],
    'bamako': [12.6392, -8.0029], 'lome': [6.1725, 1.2314], 'cotonou': [6.3703, 2.3912]
};

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length < 2) {
                return await sock.sendMessage(from, { text: `📏 .distance <ville1> <ville2>\n\nVilles dispo: ${Object.keys(CITIES).join(', ')}` });
            }
            const c1 = args[0].toLowerCase().replace(/\s/g, '');
            const c2 = args[1].toLowerCase().replace(/\s/g, '');
            if (!CITIES[c1] || !CITIES[c2]) {
                return await sock.sendMessage(from, { text: `❌ Ville inconnue. Dispo: ${Object.keys(CITIES).join(', ')}` });
            }
            const [lat1, lon1] = CITIES[c1];
            const [lat2, lon2] = CITIES[c2];
            const km = haversine(lat1, lon1, lat2, lon2);

            await sock.sendMessage(from, {
                text: `📏 *DISTANCE*\n\n${args[0]} ↔️ ${args[1]}\n\n📐 ${Math.round(km).toLocaleString()} km (à vol d'oiseau)`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
