module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const length = Math.min(64, Math.max(6, parseInt(args[0]) || 16));
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
            let pass = '';
            for (let i = 0; i < length; i++) pass += chars[Math.floor(Math.random() * chars.length)];
            await sock.sendMessage(from, { text: `🔐 *MOT DE PASSE GÉNÉRÉ*\n\n\`${pass}\`\n\n📏 Longueur: ${length} caractères` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
