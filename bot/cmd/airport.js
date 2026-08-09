const AIRPORTS = {
    'paris': { name: 'Charles de Gaulle (CDG)', code: 'CDG' },
    'london': { name: 'Heathrow (LHR)', code: 'LHR' },
    'newyork': { name: 'JFK International', code: 'JFK' },
    'tokyo': { name: 'Narita International (NRT)', code: 'NRT' },
    'dubai': { name: 'Dubai International (DXB)', code: 'DXB' },
    'abidjan': { name: 'Félix-Houphouët-Boigny (ABJ)', code: 'ABJ' },
    'douala': { name: 'Aéroport International de Douala (DLA)', code: 'DLA' },
    'yaounde': { name: 'Aéroport International de Yaoundé-Nsimalen (NSI)', code: 'NSI' },
    'dakar': { name: 'Blaise Diagne International (DSS)', code: 'DSS' },
    'kinshasa': { name: 'N\'djili International (FIH)', code: 'FIH' },
    'casablanca': { name: 'Mohammed V International (CMN)', code: 'CMN' },
    'lagos': { name: 'Murtala Muhammed International (LOS)', code: 'LOS' },
    'bamako': { name: 'Modibo Keïta International (BKO)', code: 'BKO' },
    'lome': { name: 'Gnassingbé Eyadéma International (LFW)', code: 'LFW' },
    'cotonou': { name: 'Cadjehoun Airport (COO)', code: 'COO' }
};

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) {
                return await sock.sendMessage(from, { text: `✈️ .airport <ville>\n\nVilles: ${Object.keys(AIRPORTS).join(', ')}` });
            }
            const city = args.join(' ').toLowerCase().replace(/\s/g, '');
            const airport = AIRPORTS[city];
            if (!airport) return await sock.sendMessage(from, { text: `❌ Ville inconnue. Dispo: ${Object.keys(AIRPORTS).join(', ')}` });

            await sock.sendMessage(from, { text: `✈️ *AÉROPORT - ${args.join(' ').toUpperCase()}*\n\n🛫 ${airport.name}\n🔤 Code IATA: ${airport.code}` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
