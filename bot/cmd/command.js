const fs = require('fs');
const path = require('path');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const files = fs.readdirSync(path.join(__dirname)).filter(f => f.endsWith('.js'));
            await sock.sendMessage(from, { text: `📋 Le bot compte actuellement *${files.length} commandes*\n\nTape .menu pour voir la liste complète` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
