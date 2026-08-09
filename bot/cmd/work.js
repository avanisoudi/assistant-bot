const fs = require('fs');
const path = require('path');
const { isBotAdmin } = require('../lib/botAdmins');

const COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes
const ADMIN_REWARD = 1024; // Montant fixe pour les administrateurs du Bot

const JOBS = [
    'Designer', 'Vendeur', 'Ouvrier', 'Professeur', 'Livreur', 'Community Manager',
    'Cuisinier', 'Chauffeur', 'Électricien', 'Plombier', 'Photographe', 'Journaliste',
    'Coiffeur', 'Mécanicien', 'Serveur', 'Agriculteur', 'Infirmier', 'Comptable',
    'Menuisier', 'Vigile'
];

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const dbPath = path.join(__dirname, '..', 'db', 'economy.json');
            let economy = {};

            if (fs.existsSync(dbPath)) {
                economy = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            }

            if (!economy[sender]) {
                economy[sender] = { coins: 0 };
            }

            const now = Date.now();
            const lastWork = economy[sender].lastWork || 0;
            if (now - lastWork < COOLDOWN_MS) {
                const left = COOLDOWN_MS - (now - lastWork);
                const secs = Math.ceil(left / 1000);
                return await sock.sendMessage(from, { text: `⏳ Tu dois attendre encore ${secs}s avant de retravailler` });
            }

            const isAdmin = await isBotAdmin(sender, sock);
            const job = isAdmin ? 'Développeur Bot🤖' : JOBS[Math.floor(Math.random() * JOBS.length)];
            let earned = isAdmin ? ADMIN_REWARD : (Math.floor(Math.random() * (124 - 50 + 1)) + 50);

            let potionUsed = false;
            if (economy[sender].potionXpActive) {
                earned *= 2;
                economy[sender].potionXpActive = false;
                potionUsed = true;
            }

            economy[sender].coins = (economy[sender].coins || 0) + earned;
            economy[sender].lastWork = now;
            fs.writeFileSync(dbPath, JSON.stringify(economy, null, 2));

            await sock.sendMessage(from, {
                text: `💼 *TRAVAIL*\n\n📋 Poste: ${job}\n💰 Gagné: +${earned} coins${potionUsed ? ' (🧪 potion x2 appliquée)' : ''}\n🏦 Total: ${economy[sender].coins} coins\n\n⏳ Prochain travail dans 3 minutes`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
