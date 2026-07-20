module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const slaps = [
                "💥 *SLAP!* 👋",
                "🤨 *OUF!* Une claque bien placée!",
                "😤 *POW!* Aïe ça fait mal!",
                "🔥 *WHAM!* Claque épique!",
                "😵 *BOOM!* Claque déflagration!",
                "⚡ *ZAP!* Claque éclair!"
            ];

            const randomSlap = slaps[Math.floor(Math.random() * slaps.length)];

            await sock.sendMessage(from, {
                text: `✦ *CLAQUE* ✦\n\n${randomSlap}`
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, {
                text: "❌ Erreur"
            });
        }
    }
};
