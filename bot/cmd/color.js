module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
            const r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
            await sock.sendMessage(from, { text: `🎨 *COULEUR ALÉATOIRE*\n\nHex: ${hex}\nRGB: rgb(${r}, ${g}, ${b})` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
