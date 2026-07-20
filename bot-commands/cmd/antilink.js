const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'groups.json');
const whitelistPath = path.join(__dirname, '..', 'db', 'whitelist.json');

function loadDB() {
    if (!fs.existsSync(dbPath)) return {};
    try { return JSON.parse(fs.readFileSync(dbPath, 'utf-8')); }
    catch (e) { return {}; }
}

function saveDB(db) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function loadWhitelist() {
    if (!fs.existsSync(whitelistPath)) return {};
    try { return JSON.parse(fs.readFileSync(whitelistPath, 'utf-8')); }
    catch (e) { return {}; }
}

function saveWhitelist(wl) {
    fs.mkdirSync(path.dirname(whitelistPath), { recursive: true });
    fs.writeFileSync(whitelistPath, JSON.stringify(wl, null, 2));
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

        const subcommand = args[0]?.toLowerCase();
        const db = loadDB();
        if (!db[from]) db[from] = {};

        // 📋 AFFICHER LE STATUT ET L'AIDE
        if (!subcommand || subcommand === 'help' || subcommand === 'status') {
            const settings = db[from].antilinkSettings || {
                enabled: false,
                mode: 'all',
                maxWarnings: 3,
                deleteMessage: true,
                warnUser: true,
                whitelist: []
            };

            const whitelist = loadWhitelist()[from] || [];

            let text = `╭───「 🛡️ *ANTILINK ULTRA* 」\n`;
            text += `│\n`;
            text += `│ *📊 STATUT :*\n`;
            text += `│ ${settings.enabled ? '✅ Activé' : '❌ Désactivé'}\n`;
            text += `│\n`;
            text += `│ *⚙️ CONFIGURATION :*\n`;
            text += `│ 🎯 Mode : *${settings.mode}*\n`;
            text += `│ ⚠️ Max warnings : *${settings.maxWarnings}*\n`;
            text += `│ 🗑️ Supprimer msg : *${settings.deleteMessage ? 'Oui' : 'Non'}*\n`;
            text += `│ 📢 Avertir user : *${settings.warnUser ? 'Oui' : 'Non'}*\n`;
            text += `│\n`;
            text += `│ *📜 LISTE BLANCHE (${whitelist.length}) :*\n`;
            if (whitelist.length === 0) {
                text += `│ Aucune domaine whitelisté\n`;
            } else {
                whitelist.slice(0, 10).forEach(d => {
                    text += `│ • ${d}\n`;
                });
                if (whitelist.length > 10) {
                    text += `│ ... et ${whitelist.length - 10} autres\n`;
                }
            }
            text += `│\n`;
            text += `│ *🎯 MODES DISPONIBLES :*\n`;
            text += `│ • *all* - Bloque TOUS les liens\n`;
            text += `│ • *whatsapp* - Bloque seulement WhatsApp\n`;
            text += `│ • *strict* - Bloque tout + anti-contournement\n`;
            text += `│ • *custom* - Utilise la whitelist\n`;
            text += `│\n`;
            text += `│ *📝 COMMANDES :*\n`;
            text += `│ • \`.antilink on/off\`\n`;
            text += `│ • \`.antilink mode <mode>\`\n`;
            text += `│ • \`.antilink maxwarn <nombre>\`\n`;
            text += `│ • \`.antilink delete on/off\`\n`;
            text += `│ • \`.antilink warn on/off\`\n`;
            text += `│ • \`.antilink whitelist add <domaine>\`\n`;
            text += `│ • \`.antilink whitelist remove <domaine>\`\n`;
            text += `│ • \`.antilink whitelist list\`\n`;
            text += `│ • \`.antilink reset @user\`\n`;
            text += `│ • \`.antilink logs\`\n`;
            text += `╰──────────────────`;

            return sock.sendMessage(from, { text });
        }

        // ✅ ON / ❌ OFF
        if (subcommand === 'on') {
            if (!db[from].antilinkSettings) {
                db[from].antilinkSettings = {
                    enabled: true,
                    mode: 'all',
                    maxWarnings: 3,
                    deleteMessage: true,
                    warnUser: true,
                    whitelist: []
                };
            } else {
                db[from].antilinkSettings.enabled = true;
            }
            saveDB(db);
            return sock.sendMessage(from, { 
                text: "🛡️ *Antilink ULTRA activé !*\n\n🎯 Mode : " + (db[from].antilinkSettings.mode || 'all') 
            });
        }

        if (subcommand === 'off') {
            if (db[from].antilinkSettings) {
                db[from].antilinkSettings.enabled = false;
                saveDB(db);
            }
            return sock.sendMessage(from, { text: "🛡️ *Antilink désactivé.*" });
        }

        // 🎯 MODE
        if (subcommand === 'mode') {
            const mode = args[1]?.toLowerCase();
            const validModes = ['all', 'whatsapp', 'strict', 'custom'];
            
            if (!mode || !validModes.includes(mode)) {
                return sock.sendMessage(from, { 
                    text: `❌ Mode invalide.\n\nModes disponibles :\n• *all* - Tous les liens\n• *whatsapp* - Liens WhatsApp seulement\n• *strict* - Mode strict (anti-contournement)\n• *custom* - Utilise la whitelist` 
                });
            }

            if (!db[from].antilinkSettings) {
                db[from].antilinkSettings = { enabled: false, mode, maxWarnings: 3, deleteMessage: true, warnUser: true };
            } else {
                db[from].antilinkSettings.mode = mode;
            }
            saveDB(db);
            return sock.sendMessage(from, { text: `🎯 Mode antilink : *${mode}*` });
        }

        // ⚠️ MAX WARNINGS
        if (subcommand === 'maxwarn') {
            const max = parseInt(args[1]);
            if (isNaN(max) || max < 1 || max > 10) {
                return sock.sendMessage(from, { text: "❌ Nombre invalide (1-10)" });
            }

            if (!db[from].antilinkSettings) {
                db[from].antilinkSettings = { enabled: false, mode: 'all', maxWarnings: max, deleteMessage: true, warnUser: true };
            } else {
                db[from].antilinkSettings.maxWarnings = max;
            }
            saveDB(db);
            return sock.sendMessage(from, { text: `⚠️ Max warnings : *${max}*` });
        }

        // 🗑️ DELETE ON/OFF
        if (subcommand === 'delete') {
            const option = args[1]?.toLowerCase();
            if (!['on', 'off'].includes(option)) {
                return sock.sendMessage(from, { text: "❌ Usage : `.antilink delete on/off`" });
            }

            if (!db[from].antilinkSettings) {
                db[from].antilinkSettings = { enabled: false, mode: 'all', maxWarnings: 3, deleteMessage: option === 'on', warnUser: true };
            } else {
                db[from].antilinkSettings.deleteMessage = option === 'on';
            }
            saveDB(db);
            return sock.sendMessage(from, { text: `🗑️ Suppression auto : *${option === 'on' ? 'Oui' : 'Non'}*` });
        }

        // 📢 WARN ON/OFF
        if (subcommand === 'warn') {
            const option = args[1]?.toLowerCase();
            if (!['on', 'off'].includes(option)) {
                return sock.sendMessage(from, { text: "❌ Usage : `.antilink warn on/off`" });
            }

            if (!db[from].antilinkSettings) {
                db[from].antilinkSettings = { enabled: false, mode: 'all', maxWarnings: 3, deleteMessage: true, warnUser: option === 'on' };
            } else {
                db[from].antilinkSettings.warnUser = option === 'on';
            }
            saveDB(db);
            return sock.sendMessage(from, { text: `📢 Avertissement : *${option === 'on' ? 'Oui' : 'Non'}*` });
        }

        // 📜 WHITELIST
        if (subcommand === 'whitelist' || subcommand === 'wl') {
            const action = args[1]?.toLowerCase();
            const whitelist = loadWhitelist();
            if (!whitelist[from]) whitelist[from] = [];

            if (!action || action === 'list') {
                let text = `╭───「 📜 *WHITELIST ANTILINK* 」\n`;
                if (whitelist[from].length === 0) {
                    text += `│\n│ Aucune domaine whitelisté\n`;
                } else {
                    text += `│\n`;
                    whitelist[from].forEach((d, i) => {
                        text += `│ ${i + 1}. ${d}\n`;
                    });
                }
                text += `│\n╰──────────────────\n\n`;
                text += `Usage :\n• \`.antilink wl add <domaine>\`\n• \`.antilink wl remove <domaine>\`\n• \`.antilink wl clear\``;
                return sock.sendMessage(from, { text });
            }

            if (action === 'add') {
                const domain = args[2]?.toLowerCase();
                if (!domain) {
                    return sock.sendMessage(from, { text: "❌ Usage : `.antilink wl add <domaine>`" });
                }

                if (whitelist[from].includes(domain)) {
                    return sock.sendMessage(from, { text: `⚠️ ${domain} est déjà dans la whitelist` });
                }

                whitelist[from].push(domain);
                saveWhitelist(whitelist);
                return sock.sendMessage(from, { text: `✅ *${domain}* ajouté à la whitelist` });
            }

            if (action === 'remove') {
                const domain = args[2]?.toLowerCase();
                if (!domain) {
                    return sock.sendMessage(from, { text: "❌ Usage : `.antilink wl remove <domaine>`" });
                }

                const idx = whitelist[from].indexOf(domain);
                if (idx === -1) {
                    return sock.sendMessage(from, { text: `⚠️ ${domain} n'est pas dans la whitelist` });
                }

                whitelist[from].splice(idx, 1);
                saveWhitelist(whitelist);
                return sock.sendMessage(from, { text: `✅ *${domain}* retiré de la whitelist` });
            }

            if (action === 'clear') {
                whitelist[from] = [];
                saveWhitelist(whitelist);
                return sock.sendMessage(from, { text: "🗑️ Whitelist vidée" });
            }

            return sock.sendMessage(from, { text: "❌ Action invalide" });
        }

        // 🔄 RESET WARNINGS
        if (subcommand === 'reset') {
            const { resetWarnings } = require('../lib/sanctions');
            
            let target = null;
            if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
                target = msg.message.extendedTextMessage.contextInfo.participant;
            } else if (args[1]) {
                target = `${args[1].replace(/[^0-9]/g, '')}@s.whatsapp.net`;
            }

            if (!target) {
                return sock.sendMessage(from, { text: "❌ Usage : `.antilink reset @user`" });
            }

            resetWarnings(from, target);
            return sock.sendMessage(from, { 
                text: `✅ Warnings de @${target.split('@')[0]} réinitialisés`,
                mentions: [target]
            });
        }

        // 📊 LOGS
        if (subcommand === 'logs') {
            const logPath = path.join(__dirname, '..', 'db', 'antilink-logs.json');
            if (!fs.existsSync(logPath)) {
                return sock.sendMessage(from, { text: "📊 Aucun log disponible" });
            }

            try {
                const logs = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
                const groupLogs = logs.filter(l => l.groupId === from).slice(-10);

                if (groupLogs.length === 0) {
                    return sock.sendMessage(from, { text: "📊 Aucune tentative de lien dans ce groupe" });
                }

                let text = `╭───「 📊 *LOGS ANTILINK* 」\n`;
                text += `│\n`;
                text += `│ *Dernières tentatives :*\n`;
                
                groupLogs.reverse().forEach((log, i) => {
                    const time = new Date(log.timestamp).toLocaleString('fr-FR', { 
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
                    });
                    text += `│\n`;
                    text += `│ ${i + 1}. @${log.userId.split('@')[0]}\n`;
                    text += `│    🕐 ${time}\n`;
                    text += `│    🔗 Types : ${log.types.join(', ')}\n`;
                    text += `│    📎 ${log.links[0]?.substring(0, 40)}${log.links[0]?.length > 40 ? '...' : ''}\n`;
                });
                
                text += `│\n╰──────────────────`;

                const mentions = groupLogs.map(l => l.userId);
                return sock.sendMessage(from, { text, mentions });
            } catch (error) {
                console.error("Erreur logs:", error);
                return sock.sendMessage(from, { text: "❌ Erreur lors de la lecture des logs" });
            }
        }

        return sock.sendMessage(from, { text: "❌ Sous-commande inconnue.\nFais `.antilink` pour voir l'aide." });
    }
};