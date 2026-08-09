const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');
const { SHOP_ITEMS } = require('./shop.js');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: `💰 .sell <objet>\nRevend un objet de ton inventaire (à moitié prix)` });
            const itemName = args[0].toLowerCase();
            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);

            const idx = user.inventory.indexOf(itemName);
            if (idx === -1) return await sock.sendMessage(from, { text: `❌ Tu ne possèdes pas cet objet. Vérifie avec .inventory` });

            const item = SHOP_ITEMS[itemName];
            const sellPrice = item ? Math.floor(item.price / 2) : 50;

            const db = loadEconomy();
            db[sender].inventory.splice(idx, 1);
            db[sender].coins += sellPrice;
            saveEconomy(db);

            await sock.sendMessage(from, { text: `✅ Vendu: ${itemName} pour ${sellPrice} coins\n🏦 Solde: ${db[sender].coins} coins` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
