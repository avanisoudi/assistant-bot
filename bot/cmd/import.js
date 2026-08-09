module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            await sock.sendMessage(from, {
                text: `📥 *IMPORT*\n\nPour l'instant, l'import de données se fait manuellement par le développeur pour éviter les abus.\n\nContacte le support avec .support si tu as besoin de restaurer d'anciennes données.`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
