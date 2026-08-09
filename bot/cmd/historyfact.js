module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const facts = [
                '📜 Le 14 juillet 1789: Prise de la Bastille',
                '⚔️ Les Jeux Olympiques ont été créés en 776 av. J.-C.',
                '🎨 La Joconde a été peinte au XVIe siècle',
                '🏰 Notre-Dame date du XIIe siècle',
                '🚀 Le premier homme sur la Lune: 20 juillet 1969'
            ];
            const fact = facts[Math.floor(Math.random() * facts.length)];
            await sock.sendMessage(from, { text: `📚 *FAIT HISTORIQUE*\n\n${fact}` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
