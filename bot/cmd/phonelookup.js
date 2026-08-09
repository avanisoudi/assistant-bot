const COUNTRY_CODES = {
    '237': 'Cameroun', '33': 'France', '1': 'États-Unis/Canada', '44': 'Royaume-Uni',
    '221': 'Sénégal', '225': 'Côte d\'Ivoire', '243': 'RD Congo', '224': 'Guinée',
    '223': 'Mali', '226': 'Burkina Faso', '227': 'Niger', '228': 'Togo', '229': 'Bénin',
    '212': 'Maroc', '213': 'Algérie', '216': 'Tunisie', '234': 'Nigeria', '254': 'Kenya',
    '27': 'Afrique du Sud', '241': 'Gabon', '242': 'Congo'
};

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '📞 .phonelookup <numéro avec indicatif>\nExemple: .phonelookup 237651543248' });
            const number = args[0].replace(/[^0-9]/g, '');

            let found = null;
            for (const [code, country] of Object.entries(COUNTRY_CODES).sort((a,b) => b[0].length - a[0].length)) {
                if (number.startsWith(code)) { found = country; break; }
            }

            await sock.sendMessage(from, { text: found ? `📞 Indicatif détecté: *${found}*` : '❌ Indicatif non reconnu dans ma base' });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
