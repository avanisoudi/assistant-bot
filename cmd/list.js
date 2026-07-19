module.exports = {
    execute: async (sock, msg, from, args) => {
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ Groupe uniquement !" });
        }

        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;

        const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
        const members = participants.filter(p => !p.admin);

        let text = `╭───「 *MEMBRES : ${metadata.subject}* 」\n`;
        text += `│ 👥 Total : *${participants.length}*\n`;
        text += `│ 👑 Admins : *${admins.length}*\n`;
        text += `│ 👤 Membres : *${members.length}*\n`;
        text += `│\n`;

        text += `│ *👑 ADMINS :*\n`;
        admins.forEach((a, i) => {
            const crown = a.admin === 'superadmin' ? '👑' : '⭐';
            text += `│ ${crown} @${a.id.split('@')[0]}\n`;
        });

        text += `│\n│ *👤 MEMBRES :*\n`;
        members.forEach((m, i) => {
            text += `│ ${i + 1}. @${m.id.split('@')[0]}\n`;
        });

        text += `╰──────────────────`;

        const mentions = participants.map(p => p.id);
        sock.sendMessage(from, { text: text, mentions: mentions });
    }
};
