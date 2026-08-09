const fs = require('fs');
const path = require('path');
const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');
const jackpotPath = path.join(__dirname, '..', 'db', 'jackpot.json');

function loadJackpot() {
    try { return fs.existsSync(jackpotPath) ? JSON.parse(fs.readFileSync(jackpotPath, 'utf-8')) : { pot: 500 }; }
    catch { return { pot: 500 }; }
}
function saveJackpot(d) { fs.writeFileSync(jackpotPath, JSON.stringify(d, null, 2)); }

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const jackpot = loadJackpot();
            const sender = msg.key.participant || msg.key.remoteJid;

            if (!args[0]) {
                return await sock.sendMessage(from, { text: `💰 *CAGNOTTE ACTUELLE: ${jackpot.pot} coins*\n\n.jackpot try <mise> pour tenter ta chance (1% de tout gagner)` });
            }

            if (args[0] === 'try') {
                const bet = parseInt(args[1]);
                if (!bet || bet <= 0) return await sock.sendMessage(from, { text: `💰 .jackpot try <mise>` });
                const user = getUser(sender);
                if (user.coins < bet) return await sock.sendMessage(from, { text: `❌ Solde insuffisant` });

                const db = loadEconomy();
                db[sender].coins -= bet;
                jackpot.pot += bet;

                const win = Math.random() < 0.01; // 1% de chance
                if (win) {
                    const won = jackpot.pot;
                    db[sender].coins += won;
                    jackpot.pot = 500; // reset
                    saveEconomy(db);
                    saveJackpot(jackpot);
                    return await sock.sendMessage(from, { text: `🎊🎊🎊 *JACKPOT GAGNÉ!!!* 🎊🎊🎊\n\n💰 Tu remportes ${won} coins!!!` });
                }

                saveEconomy(db);
                saveJackpot(jackpot);
                await sock.sendMessage(from, { text: `😢 Pas cette fois! Cagnotte augmentée à ${jackpot.pot} coins\n🏦 Ton solde: ${db[sender].coins}` });
            }
        } catch (error) {
            console.error('Erreur jackpot:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
