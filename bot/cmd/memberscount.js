module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Groupe uniquement' });
            const metadata = await sock.groupMetadata(from);
            const admins = metadata.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').length;
            await sock.sendMessage(from, { text: `👥 *${metadata.participants.length}* membres\n👮 *${admins}* admin(s)\n👤 *${metadata.participants.length - admins}* membre(s) simple(s)` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
