module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            await sock.sendMessage(from, {
                text: `☕ *SOUTENIR LE PROJET*\n\nCe bot est développé et maintenu gratuitement.\n\nSi tu veux soutenir le développeur (AVANI SOUDI), contacte-le directement pour connaître les moyens de le faire.\n\n🙏 Merci pour ton soutien!`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
