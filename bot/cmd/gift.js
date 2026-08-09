const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned && mentioned[0];
            const amount = parseInt(args.find(a => /^\d+$/.test(a)));

            if (!target || !amount || amount <= 0) {
                return await sock.sendMessage(from, { text: `🎁 .gift @user <montant>\nExemple: .gift @user 100` });
            }
            const sender = msg.key.participant || msg.key.remoteJid;
            if (target === sender) return await sock.sendMessage(from, { text: `❌ Tu ne peux pas t'offrir des coins à toi-même` });

            const senderUser = getUser(sender);
            if (senderUser.coins < amount) return await sock.sendMessage(from, { text: `❌ Solde insuffisant (tu as ${senderUser.coins} coins)` });

            getUser(target); // s'assure que le compte existe
            const db = loadEconomy();
            db[sender].coins -= amount;
            db[target].coins += amount;
            saveEconomy(db);

            await sock.sendMessage(from, {
                text: `🎁 @${sender.split('@')[0]} a offert ${amount} coins à @${target.split('@')[0]}!`,
                mentions: [sender, target]
            });
        } catch (error) {
            console.error('Erreur gift:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
