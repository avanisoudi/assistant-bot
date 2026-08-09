module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            await sock.sendMessage(from, {
                text: `🆘 *SUPPORT*\n\nBesoin d'aide?\n\n📝 .bug <description> — Signaler un bug\n💡 .suggestion <idée> — Proposer une idée\n❓ .faq — Questions fréquentes\n📘 .guide — Guide de démarrage\n\nTon message sera transmis au développeur.`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
