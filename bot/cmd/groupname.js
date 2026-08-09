module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Groupe uniquement' });
            const metadata = await sock.groupMetadata(from);
            await sock.sendMessage(from, { text: `📛 Nom du groupe: *${metadata.subject}*` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
