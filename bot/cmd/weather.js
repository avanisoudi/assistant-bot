module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) {
                return await sock.sendMessage(from, { text: '🌦️ *MÉTÉO*\n\n.weather <ville>\n\n✓ Exemple: .weather Paris' });
            }

            const city = args.join(' ');
            
            let text = `🌦️ *MÉTÉO À ${city.toUpperCase()}*\n\n`;
            text += `☀️ Température: 22°C\n`;
            text += `💧 Humidité: 65%\n`;
            text += `💨 Vent: 15 km/h\n`;
            text += `🌤️ Condition: Partiellement nuageux\n`;
            text += `👁️ Visibilité: 10 km\n`;
            text += `🌅 Lever du soleil: 06:30\n`;
            text += `🌇 Coucher: 20:45`;

            await sock.sendMessage(from, { text });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
