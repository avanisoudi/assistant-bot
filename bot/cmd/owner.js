module.exports = {
    execute: async (sock, msg, from, args) => {
        const ownerContact = '+237651543248'; // À mettre à jour
        await sock.sendMessage(from, {
            text: `*👤 Propriétaire du Bot*\n\n📱 ${ownerContact}\n\n✉️ Contactez-moi pour plus d'infos!`
        });
    }
};
