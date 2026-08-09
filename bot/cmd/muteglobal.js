const fs = require('fs');
const path = require('path');
const { isBotAdmin } = require('../lib/botAdmins');
const statePath = path.join(__dirname, '..', 'db', 'globalMute.json');

module.exports = {
    execute: async (sock, msg, from, args) => {
        const sender = msg.key.participant || msg.key.remoteJid;
        if (!(await isBotAdmin(sender, sock))) return await sock.sendMessage(from, { text: '❌ Réservé aux administrateurs du bot' });

        if (args[0] === 'on') {
            fs.writeFileSync(statePath, JSON.stringify({ muted: true }));
            await sock.sendMessage(from, { text: '🔇 Bot muet globalement (ne répondra plus aux commandes sauf des administrateurs du bot)' });
        } else if (args[0] === 'off') {
            fs.writeFileSync(statePath, JSON.stringify({ muted: false }));
            await sock.sendMessage(from, { text: '🔊 Bot réactivé pour tout le monde' });
        } else {
            let state = { muted: false };
            try { if (fs.existsSync(statePath)) state = JSON.parse(fs.readFileSync(statePath, 'utf-8')); } catch {}
            await sock.sendMessage(from, { text: `🔈 État actuel: ${state.muted ? 'MUET' : 'ACTIF'}\n\nUsage: .muteglobal on/off` });
        }
    }
};
