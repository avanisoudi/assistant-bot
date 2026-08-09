const fs = require('fs');
const path = require('path');
const DESCRIPTIONS = require('../lib/helpDescriptions');

// Repli intelligent : si la commande n'est pas documentée dans helpDescriptions.js,
// on cherche dans son propre code un message d'usage qu'elle affiche déjà (beaucoup
// de commandes répondent par ex. "❌ .lyrics <chanson>" quand on les appelle sans
// argument) — ça évite d'avoir à tout documenter à la main pour rester juste.
function extractUsageFromSource(cmdName) {
    try {
        const source = fs.readFileSync(path.join(__dirname, `${cmdName}.js`), 'utf-8');
        // Cherche en priorité une ligne qui contient littéralement ".commande" (le vrai usage),
        // pas juste n'importe quelle phrase avec un point.
        const preciseMatch = source.match(new RegExp(`[\`'"]([^\`'"]*\\.${cmdName}\\b[^\`'"]*)[\`'"]`, 'i'));
        if (preciseMatch) return preciseMatch[1].split('\\n')[0].trim();
        return null;
    } catch (e) {}
    return null;
}

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length > 0) {
                const cmdName = args[0].toLowerCase().replace(/^\./, '');
                const cmdPath = path.join(__dirname, `${cmdName}.js`);

                if (!fs.existsSync(cmdPath)) {
                    return await sock.sendMessage(from, { text: `❌ Commande "${cmdName}" introuvable. Tape .menu pour voir toutes les commandes` });
                }

                const description = DESCRIPTIONS[cmdName] || extractUsageFromSource(cmdName) || `Tape *.${cmdName}* pour l'utiliser (aucune description détaillée disponible pour le moment).`;

                return await sock.sendMessage(from, {
                    text: `📖 *COMMENT UTILISER .${cmdName}*\n\n${description}`
                });
            }

            await sock.sendMessage(from, {
                text: `🆘 *AIDE ASSISTANTBOT*\n\n.menu — Liste de toutes les commandes\n.help <commande> — Explique comment utiliser une commande précise\n.guide — Guide de démarrage\n.faq — Questions fréquentes\n.support — Contacter le support\n\n💡 Exemple: .help ban\n💡 Le préfixe des commandes est: .`
            });
        } catch (error) {
            console.error('Erreur help:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
