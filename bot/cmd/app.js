module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            let text = `╭─────────────────────────╮\n`;
            text += `│  📱 *APPLICATIONS* 📱   │\n`;
            text += `╰─────────────────────────╯\n\n`;
            
            text += `*🔴 RÉSEAUX SOCIAUX:*\n`;
            text += `├ WhatsApp\n`;
            text += `├ Instagram\n`;
            text += `├ TikTok\n`;
            text += `├ Facebook\n`;
            text += `├ Telegram\n`;
            text += `├ Snapchat\n`;
            text += `├ Twitter/X\n`;
            text += `└ YouTube\n\n`;

            text += `*🎮 JEUX:*\n`;
            text += `├ Call of Duty\n`;
            text += `├ PUBG Mobile\n`;
            text += `├ Fortnite\n`;
            text += `├ Free Fire\n`;
            text += `├ Minecraft\n`;
            text += `├ Roblox\n`;
            text += `└ Clash of Clans\n\n`;

            text += `*🎵 MUSIQUE:*\n`;
            text += `├ Spotify\n`;
            text += `├ YouTube Music\n`;
            text += `├ Apple Music\n`;
            text += `├ Amazon Music\n`;
            text += `└ SoundCloud\n\n`;

            text += `*📺 STREAMING:*\n`;
            text += `├ Netflix\n`;
            text += `├ Disney+\n`;
            text += `├ Prime Video\n`;
            text += `├ Twitch\n`;
            text += `└ YouTube\n\n`;

            text += `*💼 PRODUCTIVITÉ:*\n`;
            text += `├ Microsoft Office\n`;
            text += `├ Google Drive\n`;
            text += `├ Notion\n`;
            text += `├ Slack\n`;
            text += `└ Trello\n\n`;

            text += `*🚗 TRANSPORT:*\n`;
            text += `├ Uber\n`;
            text += `├ Lyft\n`;
            text += `├ Google Maps\n`;
            text += `└ Waze\n\n`;

            text += `╭─────────────────────────╮\n`;
            text += `│ Consultez votre App    │\n`;
            text += `│ Store pour télécharger │\n`;
            text += `╰─────────────────────────╯`;

            await sock.sendMessage(from, { text });
        } catch (error) {
            console.error('Erreur app:', error);
            await sock.sendMessage(from, { text: '❌ Erreur lors de l\'exécution' });
        }
    }
};
