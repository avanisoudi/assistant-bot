const fs = require('fs');
const path = require('path');

const warnsPath = path.join(__dirname, '..', 'warns.json');

function loadWarns() {
    if (!fs.existsSync(warnsPath)) {
        fs.writeFileSync(warnsPath, JSON.stringify({}));
        return {};
    }
    return JSON.parse(fs.readFileSync(warnsPath, 'utf-8'));
}

function saveWarns(warns) {
    fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 2));
}

module.exports = {
    execute: async (sock, msg, from, args) => {
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ Groupe uniquement !" });
        }

        const sender = msg.key.participant || msg.key.remoteJid;
        const metadata = await sock.groupMetadata(from);
        const senderInfo = metadata.participants.find(p => p.id === sender);

        if (!senderInfo || !senderInfo.admin) {
            return sock.sendMessage(from, { text: "❌ Tu dois être admin !" });
        }

        let target = null;
        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
            target = msg.message.extendedTextMessage.contextInfo.participant;
        }

        if (!target) {
            return sock.sendMessage(from, { text: "❌ Usage : `.warn @user`" });
        }

        const warns = loadWarns();
        if (!warns[from]) warns[from] = {};
        if (!warns[from][target]) warns[from][target] = 0;

        warns[from][target]++;
        const count = warns[from][target];

        saveWarns(warns);

        if (count >= 3) {
            try {
                await sock.groupParticipantsUpdate(from, [target], 'remove');
                delete warns[from][target];
                saveWarns(warns);
                return sock.sendMessage(from, {
                    text: `🚫 @${target.split('@')[0]} a reçu 3 warnings et a été expulsé !`,
                    mentions: [target]
                });
            } catch (error) {
                return sock.sendMessage(from, { text: "❌ Impossible d'expulser." });
            }
        }

        sock.sendMessage(from, {
            text: `⚠️ @${target.split('@')[0]} a reçu un warning !\n📊 Warnings : *${count}/3*`,
            mentions: [target]
        });
    }
};
