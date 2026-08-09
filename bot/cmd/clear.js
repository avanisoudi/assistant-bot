const fs = require('fs');
const path = require('path');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const target = args[0]?.toLowerCase();
            if (target === 'warns') {
                const dbPath = path.join(__dirname, '..', 'db', 'warns.json');
                let db = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf-8')) : {};
                db[from] = {};
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
                return await sock.sendMessage(from, { text: '✅ Tous les avertissements du groupe ont été réinitialisés' });
            }
            await sock.sendMessage(from, { text: '🧹 Utilise: .clear warns → réinitialise les avertissements du groupe' });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
