const ACRONYMS = {
    'lol': 'Laughing Out Loud', 'asap': 'As Soon As Possible', 'diy': 'Do It Yourself',
    'faq': 'Frequently Asked Questions', 'gif': 'Graphics Interchange Format',
    'html': 'HyperText Markup Language', 'usb': 'Universal Serial Bus',
    'pdf': 'Portable Document Format', 'sms': 'Short Message Service',
    'vip': 'Very Important Person', 'atm': 'Automated Teller Machine',
    'brb': 'Be Right Back', 'btw': 'By The Way', 'imo': 'In My Opinion'
};

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: `🔠 .acronymreveal <sigle>\nExemples connus: ${Object.keys(ACRONYMS).join(', ')}` });
            const acronym = args[0].toLowerCase();
            const meaning = ACRONYMS[acronym];
            await sock.sendMessage(from, { text: meaning ? `🔠 *${acronym.toUpperCase()}*\n\n${meaning}` : `❌ Sigle inconnu dans ma base` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
