module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🎨 .hex2rgb <code hex>\nExemple: .hex2rgb #FF5733' });
            let hex = args[0].replace('#', '');
            if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return await sock.sendMessage(from, { text: '❌ Code hex invalide (format: #RRGGBB)' });

            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);

            await sock.sendMessage(from, { text: `🎨 *#${hex.toUpperCase()}*\n\nRGB: rgb(${r}, ${g}, ${b})\nR: ${r}\nG: ${g}\nB: ${b}` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
