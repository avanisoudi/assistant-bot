const moment = require('moment-timezone');

const CITIES = {
    'paris': 'Europe/Paris', 'london': 'Europe/London', 'newyork': 'America/New_York',
    'tokyo': 'Asia/Tokyo', 'dubai': 'Asia/Dubai', 'abidjan': 'Africa/Abidjan',
    'douala': 'Africa/Douala', 'dakar': 'Africa/Dakar', 'kinshasa': 'Africa/Kinshasa',
    'casablanca': 'Africa/Casablanca', 'tunis': 'Africa/Tunis', 'lagos': 'Africa/Lagos',
    'moscow': 'Europe/Moscow', 'sydney': 'Australia/Sydney', 'losangeles': 'America/Los_Angeles'
};

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) {
                return await sock.sendMessage(from, {
                    text: `🌍 .timezone <ville>\n\nVilles: ${Object.keys(CITIES).join(', ')}`
                });
            }
            const city = args[0].toLowerCase().replace(/\s/g, '');
            const tz = CITIES[city];
            if (!tz) return await sock.sendMessage(from, { text: `❌ Ville inconnue. Essaie: ${Object.keys(CITIES).join(', ')}` });

            const time = moment().tz(tz).format('dddd DD MMMM YYYY, HH:mm:ss');
            await sock.sendMessage(from, { text: `🌍 *${args[0].toUpperCase()}*\n\n🕐 ${time}` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
