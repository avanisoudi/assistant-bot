module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '❌ .unblock <numéro> (ex: .unblock 22961234567)' });
            const number = args[0].replace(/[^0-9]/g, '');
            const target = number + '@s.whatsapp.net';

            await sock.updateBlockStatus(target, 'unblock');
            await sock.sendMessage(from, { text: `✅ @${number} a été débloqué`, mentions: [target] });
        } catch (error) {
            console.error('Erreur unblock:', error);
            await sock.sendMessage(from, { text: '❌ Erreur lors du déblocage' });
        }
    }
};
