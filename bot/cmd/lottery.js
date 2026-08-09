const fs = require('fs');
const path = require('path');
const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');
const lotteryPath = path.join(__dirname, '..', 'db', 'lottery.json');

function loadLottery() {
    try { return fs.existsSync(lotteryPath) ? JSON.parse(fs.readFileSync(lotteryPath, 'utf-8')) : { pot: 0, tickets: [] }; }
    catch { return { pot: 0, tickets: [] }; }
}
function saveLottery(d) { fs.writeFileSync(lotteryPath, JSON.stringify(d, null, 2)); }

const TICKET_PRICE = 100;

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);
            const lottery = loadLottery();

            if (args[0] === 'draw') {
                // Tirage manuel (accessible à tous pour la démo, tire un gagnant parmi les tickets)
                if (lottery.tickets.length === 0) return await sock.sendMessage(from, { text: '🎟️ Aucun ticket vendu pour le moment' });
                const winnerId = lottery.tickets[Math.floor(Math.random() * lottery.tickets.length)];
                const db = loadEconomy();
                getUser(winnerId);
                db[winnerId].coins += lottery.pot;
                saveEconomy(db);
                const wonAmount = lottery.pot;
                lottery.pot = 0;
                lottery.tickets = [];
                saveLottery(lottery);
                return await sock.sendMessage(from, {
                    text: `🎉 *TIRAGE DE LA LOTERIE*\n\n🏆 Gagnant: @${winnerId.split('@')[0]}\n💰 Cagnotte remportée: ${wonAmount} coins`,
                    mentions: [winnerId]
                });
            }

            if (user.coins < TICKET_PRICE) return await sock.sendMessage(from, { text: `❌ Un ticket coûte ${TICKET_PRICE} coins (tu as ${user.coins})` });

            const db = loadEconomy();
            db[sender].coins -= TICKET_PRICE;
            saveEconomy(db);

            lottery.pot += TICKET_PRICE;
            lottery.tickets.push(sender);
            saveLottery(lottery);

            await sock.sendMessage(from, {
                text: `🎟️ Ticket acheté pour ${TICKET_PRICE} coins!\n\n💰 Cagnotte actuelle: ${lottery.pot} coins\n🎫 Tickets vendus: ${lottery.tickets.length}\n\n💡 .lottery draw pour lancer le tirage`
            });
        } catch (error) {
            console.error('Erreur lottery:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
