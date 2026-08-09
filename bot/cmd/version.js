const fs = require('fs');
const path = require('path');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
            const cmdCount = fs.readdirSync(path.join(__dirname)).filter(f => f.endsWith('.js')).length;
            await sock.sendMessage(from, {
                text: `📦 *VERSION*\n\n🤖 ${pkg.name} v${pkg.version}\n📋 ${cmdCount} commandes\n⚙️ Node.js ${process.version}`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
