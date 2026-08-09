module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Groupe seulement' });
            if (args.length === 0) return await sock.sendMessage(from, { text: '❌ .unban <numéro> (ex: .unban 22961234567)' });

            const number = args[0].replace(/[^0-9]/g, '');
            const target = number + '@s.whatsapp.net';

            await sock.groupParticipantsUpdate(from, [target], 'add');
            await sock.sendMessage(from, { text: `✅ @${number} a été ré-ajouté au groupe`, mentions: [target] });
        } catch (error) {
            console.error('Erreur unban:', error);
            await sock.sendMessage(from, { text: '❌ Erreur (le numéro doit avoir quitté récemment ou avoir la confidentialité ouverte)' });
        }
    }
};
