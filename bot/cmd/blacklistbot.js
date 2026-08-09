const { checkAdmin } = require('../lib/adminCheck');
const fs = require('fs');
const path = require('path');
const blacklistPath = path.join(__dirname, '..', 'db', 'botNumbers.json');

function loadList() { try { return fs.existsSync(blacklistPath) ? JSON.parse(fs.readFileSync(blacklistPath, 'utf-8')) : []; } catch { return []; } }
function saveList(l) { fs.writeFileSync(blacklistPath, JSON.stringify(l, null, 2)); }

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Groupe seulement' });
            const { isAdmin, senderJid, debug } = await checkAdmin(sock, from, msg);
            if (!isAdmin) {
                console.log('[adminCheck] Refus admin:', JSON.stringify(debug));
                return sock.sendMessage(from, { text: "❌ Tu dois être admin (ou créateur) du groupe !" });
            }

            const list = loadList();

            if (args[0] === 'list') {
                return await sock.sendMessage(from, { text: `🤖 *NUMÉROS BLACKLISTÉS*\n\n${list.map(j => j.split('@')[0]).join('\n') || 'Aucun'}` });
            }

            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned && mentioned[0];
            if (!target) return await sock.sendMessage(from, { text: `🤖 .blacklistbot @user — ajoute à la liste noire antibot\n.blacklistbot list — voir la liste` });

            if (!list.includes(target)) {
                list.push(target);
                saveList(list);
            }
            await sock.sendMessage(from, { text: `✅ @${target.split('@')[0]} sera expulsé automatiquement s'il rejoint (avec .antibot on)`, mentions: [target] });
        } catch (error) {
            console.error('Erreur blacklistbot:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
