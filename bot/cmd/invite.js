module.exports = {
    execute: async (sock, msg, from, args) => {
        const groupMetadata = await sock.groupMetadata(from);
        const inviteCode = await sock.groupInviteCode(from);
        
        await sock.sendMessage(from, {
            text: `*🔗 Lien d'Invitation*\n\nhttps://chat.whatsapp.com/${inviteCode}`
        });
    }
};
