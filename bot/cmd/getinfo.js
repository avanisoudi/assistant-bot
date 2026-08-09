module.exports = {
    execute: async (sock, msg, from, args) => {
        const groupMetadata = await sock.groupMetadata(from);
        let text = `*ℹ️ Infos du Groupe*\n\n`;
        text += `📝 Nom: ${groupMetadata.subject}\n`;
        text += `👥 Membres: ${groupMetadata.participants.length}\n`;
        text += `👤 Admin: ${groupMetadata.participants.filter(p => p.admin).length}\n`;
        text += `🔗 ID: ${groupMetadata.id}\n`;
        text += `📅 Créé: ${new Date(groupMetadata.creation * 1000).toLocaleDateString()}\n`;
        text += `🔐 Restreint: ${groupMetadata.announce ? 'Oui (Admin seul)' : 'Non'}`;
        await sock.sendMessage(from, { text });
    }
};
