const { getUser, saveEconomy, loadEconomy } = require('../lib/economy');
const { SHOP_ITEMS } = require('./shop.js');

const SHIELD_DURATION_MS = 30 * 60 * 1000; // 30 minutes par unité achetée

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: `🛒 .buy <objet> [quantité]\n\nUtilise .shop pour voir les objets disponibles` });
            const itemName = args[0].toLowerCase();
            const item = SHOP_ITEMS[itemName];
            if (!item) return await sock.sendMessage(from, { text: `❌ Objet inconnu. Utilise .shop pour voir la liste` });

            const quantity = Math.max(1, parseInt(args[1]) || 1);
            const totalPrice = item.price * quantity;

            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);

            if (user.coins < totalPrice) {
                return await sock.sendMessage(from, { text: `❌ Pas assez de coins! Il te faut ${totalPrice} coins pour ${quantity}x (tu as ${user.coins})` });
            }

            const db = loadEconomy();
            db[sender].coins -= totalPrice;

            if (itemName === 'bouclier') {
                // Le bouclier a une durée limitée qui se cumule : 1 = 30min, 2 = 60min...
                const now = Date.now();
                const currentExpiry = db[sender].shieldExpiry || 0;
                const base = Math.max(now, currentExpiry); // repart de l'expiration actuelle si encore actif
                db[sender].shieldExpiry = base + (SHIELD_DURATION_MS * quantity);
                saveEconomy(db);

                const totalMin = Math.round((db[sender].shieldExpiry - now) / 60000);
                return await sock.sendMessage(from, {
                    text: `✅ *BOUCLIER ACTIVÉ*\n\n🛡️ +${quantity * 30} minutes de protection\n⏱️ Protection active pendant: ${totalMin} minutes\n🏦 Solde restant: ${db[sender].coins} coins`
                });
            }

            if (itemName === 'coffre_mystere') {
                let totalWon = 0;
                for (let i = 0; i < quantity; i++) totalWon += Math.floor(Math.random() * (800 - 50 + 1)) + 50;
                db[sender].coins += totalWon;
                saveEconomy(db);
                return await sock.sendMessage(from, {
                    text: `🎁 *${quantity} coffre(s) ouvert(s) !*\n\n💰 Total gagné: +${totalWon} coins\n🏦 Solde: ${db[sender].coins} coins`
                });
            }

            if (itemName === 'ticket_loterie') {
                const fs = require('fs');
                const path = require('path');
                const lotteryPath = path.join(__dirname, '..', 'db', 'lottery.json');
                let lottery = { pot: 0, tickets: [] };
                try { if (fs.existsSync(lotteryPath)) lottery = JSON.parse(fs.readFileSync(lotteryPath, 'utf-8')); } catch {}
                for (let i = 0; i < quantity; i++) { lottery.pot += 90; lottery.tickets.push(sender); }
                fs.writeFileSync(lotteryPath, JSON.stringify(lottery, null, 2));
                saveEconomy(db);
                return await sock.sendMessage(from, { text: `🎟️ ${quantity} ticket(s) de loterie ajouté(s) !\n💰 Cagnotte actuelle: ${lottery.pot} coins\n🏦 Solde: ${db[sender].coins} coins` });
            }

            if (itemName === 'potion_xp') {
                db[sender].potionXpActive = true;
                saveEconomy(db);
                return await sock.sendMessage(from, { text: `🧪 Potion activée ! Ton prochain .work rapportera le double.\n🏦 Solde: ${db[sender].coins} coins` });
            }

            if (itemName === 'multiplicateur') {
                db[sender].multiplicateurActive = true;
                saveEconomy(db);
                return await sock.sendMessage(from, { text: `✨ Multiplicateur activé ! Ton prochain .daily rapportera le double.\n🏦 Solde: ${db[sender].coins} coins` });
            }

            if (itemName === 'assurance') {
                db[sender].assuranceCount = (db[sender].assuranceCount || 0) + quantity;
                saveEconomy(db);
                return await sock.sendMessage(from, { text: `📋 ${quantity} assurance(s) ajoutée(s) (${db[sender].assuranceCount} en stock)\n🏦 Solde: ${db[sender].coins} coins` });
            }

            for (let i = 0; i < quantity; i++) db[sender].inventory.push(itemName);
            saveEconomy(db);

            await sock.sendMessage(from, {
                text: `✅ *ACHAT RÉUSSI*\n\n${item.emoji} ${itemName} x${quantity} acheté pour ${totalPrice} coins\n🏦 Solde restant: ${db[sender].coins} coins`
            });
        } catch (error) {
            console.error('Erreur buy:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
