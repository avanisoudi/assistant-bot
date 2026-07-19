module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const kisses = [
                "💋 *Mwah!* 💋",
                "😘 *Bisou!* 😘",
                "🥰 *Bisou doux* 🥰",
                "😚 *Bisou sur la joue* 😚",
                "😋 *Bisou gourmand* 😋",
                "🤭 *Bisou secret* 🤭"
            ];

            const randomKiss = kisses[Math.floor(Math.random() * kisses.length)];

            await sock.sendMessage(from, {
                text: `✦ *BISOU* ✦\n\n${randomKiss}`
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, {
                text: "❌ Erreur"
            });
        }
    }
};
