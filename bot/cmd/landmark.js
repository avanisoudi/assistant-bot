const LANDMARKS = {
    'paris': 'Tour Eiffel, Musée du Louvre, Notre-Dame de Paris, Arc de Triomphe',
    'london': 'Big Ben, Tower Bridge, Buckingham Palace, London Eye',
    'newyork': 'Statue de la Liberté, Times Square, Central Park, Empire State Building',
    'tokyo': 'Tour de Tokyo, Temple Senso-ji, Shibuya Crossing, Mont Fuji (à proximité)',
    'dubai': 'Burj Khalifa, Burj Al Arab, Dubai Mall, Palm Jumeirah',
    'abidjan': 'Basilique Notre-Dame de la Paix (Yamoussoukro à proximité), Cathédrale Saint-Paul, Plateau',
    'douala': 'Marché Central, Cathédrale Saint-Pierre-et-Saint-Paul, Akwa',
    'yaounde': 'Mont Fébé, Cathédrale Notre-Dame des Victoires, Musée National',
    'dakar': 'Monument de la Renaissance Africaine, Île de Gorée, Place de l\'Indépendance',
    'kinshasa': 'Fleuve Congo, Marché Central, Académie des Beaux-Arts',
    'casablanca': 'Mosquée Hassan II, Corniche, Medina',
    'lagos': 'National Theatre, Lekki Conservation Centre, Tarkwa Bay Beach'
};

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) {
                return await sock.sendMessage(from, { text: `🏛️ .landmark <ville>\n\nVilles: ${Object.keys(LANDMARKS).join(', ')}` });
            }
            const city = args.join(' ').toLowerCase().replace(/\s/g, '');
            const landmark = LANDMARKS[city];
            if (!landmark) return await sock.sendMessage(from, { text: `❌ Ville inconnue. Dispo: ${Object.keys(LANDMARKS).join(', ')}` });

            await sock.sendMessage(from, { text: `🏛️ *LIEUX EMBLÉMATIQUES - ${args.join(' ').toUpperCase()}*\n\n📍 ${landmark}` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
