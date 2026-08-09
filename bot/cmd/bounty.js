const fs = require('fs');
const path = require('path');
const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');
const bountyPath = path.join(__dirname, '..', 'db', 'bounties.json');

function loadBounties() {
    try { return fs.existsSync(bountyPath) ? JSON.parse(fs.readFileSync(bountyPath, 'utf-8')) : {}; } catch { return {}; }
}
function saveBounties(d) { fs.writeFileSync(bountyPath, JSON.stringify(d, null, 2)); }

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const bounties = loadBounties();
            const sender = msg.key.participant || msg.key.remoteJid;

            if (args[0] === 'list' || !args[0]) {
                const entries = Object.entries(bounties).filter(([, amt]) => amt > 0);
                if (entries.length === 0) return await sock.sendMessage(from, { text: `🎯 Aucune prime active\n\n.bounty set @user <montant>` });
                let text = `🎯 *PRIMES ACTIVES*\n\n`;
                entries.forEach(([id, amt]) => text += `@${id.split('@')[0]}: ${amt} coins\n`);
                return await sock.sendMessage(from, { text, mentions: entries.map(e => e[0]) });
            }

            if (args[0] === 'set') {
                const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
                const target = mentioned && mentioned[0];
                const amount = parseInt(args.find(a => /^\d+$/.test(a)));
                if (!target || !amount) return await sock.sendMessage(from, { text: `❌ .bounty set @user <montant>` });

                const user = getUser(sender);
                if (user.coins < amount) return await sock.sendMessage(from, { text: `❌ Solde insuffisant` });

                const db = loadEconomy();
                db[sender].coins -= amount;
                saveEconomy(db);

                bounties[target] = (bounties[target] || 0) + amount;
                saveBounties(bounties);

                await sock.sendMessage(from, { text: `🎯 Prime de ${amount} coins placée sur @${target.split('@')[0]}!`, mentions: [target] });
            }
        } catch (error) {
            console.error('Erreur bounty:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
