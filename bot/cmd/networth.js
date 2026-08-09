const { getUser } = require('../lib/economy');
const { SHOP_ITEMS } = require('./shop.js');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);

            const invValue = user.inventory.reduce((sum, item) => {
                const shopItem = SHOP_ITEMS[item];
                return sum + (shopItem ? Math.floor(shopItem.price / 2) : 25);
            }, 0);

            const stockValue = Object.values(user.stocks || {}).reduce((sum, s) => sum + (s.shares * s.avgPrice), 0);
            const total = user.coins + invValue + stockValue;

            await sock.sendMessage(from, {
                text: `💎 *VALEUR NETTE*\n\n💰 Coins: ${user.coins}\n🎒 Inventaire: ~${invValue} coins\n📈 Actions: ~${Math.floor(stockValue)} coins\n\n🏆 Total: *${Math.floor(total)} coins*`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
