module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🎂 .age <JJ/MM/AAAA>\nExemple: .age 15/06/1998' });
            const [day, month, year] = args[0].split('/').map(Number);
            if (!day || !month || !year) return await sock.sendMessage(from, { text: '❌ Format invalide, utilise JJ/MM/AAAA' });

            const birthDate = new Date(year, month - 1, day);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

            await sock.sendMessage(from, { text: `🎂 Tu as *${age} ans*` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
