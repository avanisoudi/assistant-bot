module.exports = {
    execute: async (sock, msg, from, args) => {
        if (msg.quoted) {
            return await sock.sendMessage(from, {
                text: `📍 *ID du Message*\n\nGID: ${msg.quoted.sender}\n\nGroup: ${from}`
            });
        }
        await sock.sendMessage(from, {
            text: `📍 *ID du Groupe*\n\n${from}\n\n💡 Répondez à un message pour voir l'ID de l'auteur`
        });
    }
};
