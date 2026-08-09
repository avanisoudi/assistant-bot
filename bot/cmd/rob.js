const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned && mentioned[0];
            if (!target) return await sock.sendMessage(from, { text: `🦹 .rob @user\nTente de voler des coins (risqué!)` });

            const sender = msg.key.participant || msg.key.remoteJid;
            if (target === sender) return await sock.sendMessage(from, { text: `❌ Tu ne peux pas te voler toi-même` });

            const senderUser = getUser(sender);
            const targetUser = getUser(target);

            if (targetUser.shieldExpiry && targetUser.shieldExpiry > Date.now()) {
                const minsLeft = Math.ceil((targetUser.shieldExpiry - Date.now()) / 60000);
                return await sock.sendMessage(from, { text: `🛡️ @${target.split('@')[0]} est protégé par un bouclier pour encore ${minsLeft} min ! Vol impossible`, mentions: [target] });
            }
            if (targetUser.coins < 50) {
                return await sock.sendMessage(from, { text: `❌ @${target.split('@')[0]} est trop pauvre pour être volé`, mentions: [target] });
            }

            const success = Math.random() < 0.4; // 40% de réussite
            const db = loadEconomy();

            if (success) {
                const stolen = Math.min(targetUser.coins, Math.floor(Math.random() * 200) + 50);
                db[target].coins -= stolen;
                db[sender].coins += stolen;
                saveEconomy(db);
                await sock.sendMessage(from, {
                    text: `🦹 Vol réussi! @${sender.split('@')[0]} a volé ${stolen} coins à @${target.split('@')[0]}`,
                    mentions: [sender, target]
                });
            } else {
                const fine = Math.min(senderUser.coins, Math.floor(Math.random() * 100) + 30);
                let finalFine = fine;
                let assuranceUsed = false;
                if ((senderUser.assuranceCount || 0) > 0) {
                    finalFine = Math.floor(fine / 2);
                    db[sender].assuranceCount -= 1;
                    assuranceUsed = true;
                }
                db[sender].coins -= finalFine;
                saveEconomy(db);
                await sock.sendMessage(from, {
                    text: `🚔 Vol raté! @${sender.split('@')[0]} s'est fait attraper et paie ${finalFine} coins d'amende${assuranceUsed ? ' (📋 assurance appliquée, -50%)' : ''}`,
                    mentions: [sender]
                });
                return;
            }
        } catch (error) {
            console.error('Erreur rob:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
