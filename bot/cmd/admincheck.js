module.exports = {
    execute: async (sock, msg, from, args) => {
        const groupMetadata = await sock.groupMetadata(from);
        const admins = groupMetadata.participants.filter(p => p.admin);
        
        let text = `*👮 Admins du Groupe*\n\n`;
        admins.forEach((admin, i) => {
            const name = admin.id.split('@')[0];
            text += `${i + 1}. @${name}\n`;
        });
        
        await sock.sendMessage(from, { text });
    }
};
