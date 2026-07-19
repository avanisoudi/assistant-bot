const { getGroupSettings, setGroupSetting } = require('../lib/db');

module.exports = {
    execute: async (sock, msg, from, args) => {
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ Groupe uniquement !" });
        }

        const sender = msg.key.participant || msg.key.remoteJid;
        const metadata = await sock.groupMetadata(from);
        const senderInfo = metadata.participants.find(p => p.id === sender);

        if (!senderInfo || !senderInfo.admin) {
            return sock.sendMessage(from, { text: "❌ Tu dois être admin !" });
        }

        const option = args[0]?.toLowerCase();

        if (option === 'on') {
            setGroupSetting(from, 'welcome', true);
            return sock.sendMessage(from, { text: "👋 *Welcome activé !*\nLes nouveaux membres seront salués." });
        } else if (option === 'off') {
            setGroupSetting(from, 'welcome', false);
            return sock.sendMessage(from, { text: "👋 *Welcome désactivé.*" });
        } else {
            const settings = getGroupSettings(from);
            const status = settings.welcome ? "✅ Activé" : "❌ Désactivé";
            return sock.sendMessage(from, { text: `👋 *Welcome :* ${status}\n\nUsage : .welcome on/off` });
        }
    },

    handleGroupUpdate: async (sock, update) => {
        const { id, participants, action } = update;
        const { getGroupSettings } = require('../lib/db');
        const settings = getGroupSettings(id);

        if (!settings.welcome) return;

        try {
            const metadata = await sock.groupMetadata(id);
            const groupName = metadata.subject;

            for (const participant of participants) {
                const userNumber = participant.split('@')[0];
                const mention = `@${userNumber}`;

                let userPfp = null;
                try {
                    userPfp = await sock.profilePictureUrl(participant, 'image');
                } catch (e) {}

                let welcomeText = `╭───「 *BIENVENUE* 」\n`;
                welcomeText += `│\n`;
                welcomeText += `│  👋 Salut ${mention} !\n`;
                welcomeText += `│\n`;
                welcomeText += `│  🎉 Bienvenue dans *${groupName}*\n`;
                welcomeText += `│\n`;
                welcomeText += `│  📜 Lis la description\n`;
                welcomeText += `│  💬 Présente-toi\n`;
                welcomeText += `│  🤝 Amuse-toi bien !\n`;
                welcomeText += `│\n`;
                welcomeText += `╰──────────────────`;

                if (userPfp) {
                    await sock.sendMessage(id, {
                        image: { url: userPfp },
                        caption: welcomeText,
                        mentions: [participant]
                    });
                } else {
                    await sock.sendMessage(id, {
                        text: welcomeText,
                        mentions: [participant]
                    });
                }
            }
        } catch (error) {
            console.error("Erreur welcome:", error);
        }
    }
};
