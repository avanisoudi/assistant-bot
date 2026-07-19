const { makeWASocket, useMultiFileAuthState, DisconnectReason, delay, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');
const imgFolder = path.join(__dirname, 'img');
const bannedPath = path.join(__dirname, 'banned.json');
const stickersDir = path.join(__dirname, 'db', 'stickers');
const stickersIndex = path.join(stickersDir, 'index.json');
const AUTH_DIR = path.join(__dirname, 'auth_info');

// 📋 Recharge la config à chaque commande
function getConfig() {
    delete require.cache[require.resolve(configPath)];
    return require(configPath);
}

// 🖼️ Récupère une image aléatoire
function getRandomImage() {
    if (!fs.existsSync(imgFolder)) return null;
    const files = fs.readdirSync(imgFolder).filter(file =>
        ['.jpg', '.jpeg', '.png'].includes(path.extname(file).toLowerCase())
    );
    if (files.length === 0) return null;
    const randomFile = files[Math.floor(Math.random() * files.length)];
    return path.join(imgFolder, randomFile);
}

// 🚫 Vérifie si un utilisateur est banni
function isBanned(jid) {
    if (!fs.existsSync(bannedPath)) return false;
    try {
        const bannedList = JSON.parse(fs.readFileSync(bannedPath, 'utf-8'));
        return bannedList.includes(jid);
    } catch (e) {
        return false;
    }
}

// 🔗 Détecte les liens
function containsLink(text) {
    const linkRegex = /(https?:\/\/[^\s]+|chat\.whatsapp\.com\/[^\s]+|wa\.me\/[^\s]+|www\.[^\s]+)/gi;
    return linkRegex.test(text);
}

// 🤬 Détecte les mots toxiques
function containsToxic(text, toxicWords) {
    if (!text || !toxicWords || toxicWords.length === 0) return false;
    const lower = text.toLowerCase();
    return toxicWords.some(word => lower.includes(word.toLowerCase()));
}

// 📊 Charge les settings d'un groupe
function getGroupSettings(groupId) {
    const dbPath = path.join(__dirname, 'db', 'groups.json');
    let db = {};
    if (fs.existsSync(dbPath)) {
        try {
            db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        } catch (e) {
            db = {};
        }
    }
    if (!db[groupId]) {
        db[groupId] = {
            antilink: false,
            antibot: false,
            antiflood: false,
            antitoxic: false,
            antidelete: false,
            welcome: false,
            goodbye: false,
            autoread: false,
            autotype: false,
            toxicWords: ['putain', 'merde', 'connard', 'fdp', 'ntm', 'salaud']
        };
    }
    return db[groupId];
}

// 📊 Track les messages pour les stats
function trackMessage(groupId, sender, messageData) {
    const statsPath = path.join(__dirname, 'db', 'stats.json');
    let stats = {};
    if (fs.existsSync(statsPath)) {
        try {
            stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
        } catch (e) {
            stats = {};
        }
    }

    if (!stats[groupId]) {
        stats[groupId] = { totalMessages: 0, users: {}, createdAt: Date.now() };
    }

    if (!stats[groupId].users[sender]) {
        stats[groupId].users[sender] = {
            count: 0,
            types: {},
            hours: {},
            words: [],
            lastMessages: [],
            firstSeen: Date.now(),
            lastSeen: Date.now()
        };
    }

    const user = stats[groupId].users[sender];
    user.count++;
    user.lastSeen = Date.now();

    const type = messageData.type || 'other';
    user.types[type] = (user.types[type] || 0) + 1;

    const hour = new Date().getHours();
    user.hours[hour] = (user.hours[hour] || 0) + 1;

    if (messageData.text && messageData.text.length > 0) {
        const words = messageData.text.toLowerCase()
            .replace(/[^\w\sàâäéèêëïîôùûüÿç]/gi, ' ')
            .split(/\s+/)
            .filter(w => w.length > 3);

        user.words = [...user.words, ...words].slice(-50);

        user.lastMessages.push({
            text: messageData.text.substring(0, 100),
            time: Date.now()
        });
        if (user.lastMessages.length > 20) {
            user.lastMessages.shift();
        }
    }

    stats[groupId].totalMessages++;

    const usersArray = Object.entries(stats[groupId].users);
    if (usersArray.length > 100) {
        usersArray.sort((a, b) => b[1].count - a[1].count);
        const topUsers = usersArray.slice(0, 100);
        stats[groupId].users = Object.fromEntries(topUsers);
    }

    try {
        fs.mkdirSync(path.dirname(statsPath), { recursive: true });
        fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
    } catch (e) {
        console.error("Erreur sauvegarde stats:", e);
    }
}

// 📦 Sauvegarde un sticker
function saveSticker(jid, stickerBuffer, metadata = {}) {
    try {
        const chatDir = path.join(stickersDir, jid.replace(/[^a-zA-Z0-9]/g, '_'));
        fs.mkdirSync(chatDir, { recursive: true });

        const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}.webp`;
        const filepath = path.join(chatDir, filename);
        fs.writeFileSync(filepath, stickerBuffer);

        let index = {};
        if (fs.existsSync(stickersIndex)) {
            try { index = JSON.parse(fs.readFileSync(stickersIndex, 'utf-8')); }
            catch (e) { index = {}; }
        }

        if (!index[jid]) {
            index[jid] = {
                name: metadata.name || jid,
                type: metadata.type || 'unknown',
                stickers: []
            };
        }

        index[jid].stickers.push({
            filename,
            filepath,
            savedAt: Date.now(),
            sender: metadata.sender || null
        });

        fs.mkdirSync(path.dirname(stickersIndex), { recursive: true });
        fs.writeFileSync(stickersIndex, JSON.stringify(index, null, 2));
        return true;
    } catch (error) {
        console.error("Erreur sauvegarde sticker:", error);
        return false;
    }
}

// 📦 Extrait le texte d'un message
function extractText(msg) {
    const messageType = Object.keys(msg.message)[0];
    let text = "";

    if (messageType === 'conversation') {
        text = msg.message.conversation;
    } else if (messageType === 'extendedTextMessage') {
        text = msg.message.extendedTextMessage.text;
    } else if (messageType === 'imageMessage' && msg.message.imageMessage.caption) {
        text = msg.message.imageMessage.caption;
    } else if (messageType === 'videoMessage' && msg.message.videoMessage.caption) {
        text = msg.message.videoMessage.caption;
    }

    return text;
}

// 📦 Détecte le type de message
function getMessageType(msg) {
    const messageType = Object.keys(msg.message)[0];

    if (messageType === 'conversation') return "text";
    if (messageType === 'extendedTextMessage') return "text";
    if (messageType === 'imageMessage') return "image";
    if (messageType === 'videoMessage') return "video";
    if (messageType === 'stickerMessage') return "sticker";
    if (messageType === 'audioMessage') return msg.message.audioMessage.ptt ? "voice" : "audio";
    if (messageType === 'documentMessage') return "document";
    if (messageType === 'contactMessage') return "contact";
    if (messageType === 'locationMessage') return "location";
    if (messageType === 'reactionMessage') return "reaction";
    if (messageType === 'pollCreationMessage') return "poll";

    return "other";
}

// Stockage antiflood (en mémoire)
const messageHistory = {};

let pairingCodeAttempted = false;
let pendingCodeToSend = null;
let codeSent = false;

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false
    });

    // 🛠️ INTERCEPTEUR : Injecte une image aléatoire aux messages texte
    const originalSendMessage = sock.sendMessage.bind(sock);
    sock.sendMessage = async (jid, content, options = {}) => {
        const randomImgPath = getRandomImage();

        if (randomImgPath && content && content.text && !content.image) {
            content = {
                image: fs.readFileSync(randomImgPath),
                caption: content.text,
                mentions: content.mentions || [],
                quoted: content.quoted || null
            };
        }

        return await originalSendMessage(jid, content, options);
    };

    // 🔐 Connexion par Pairing Code AVANCODE
    const config = getConfig();

    if (!sock.authState.creds.registered && !pairingCodeAttempted) {
        pairingCodeAttempted = true;
        await delay(3000);
        console.log("\n╔══════════════════════════════════════╗");
        console.log("║     🤖 AVANCODE - Assistant Bot      ║");
        console.log("╠══════════════════════════════════════╣");
        try {
            const code = await sock.requestPairingCode(config.botNumber);
            console.log(`║  👉 Code de jumelage : [ ${code} ]  ║`);
            console.log("╠══════════════════════════════════════╣");
            console.log("║  ⏱️  Code valide 3 minutes            ║");
            console.log("║  📱 Ouvrez WhatsApp                  ║");
            console.log("║  ➡️  Appareils connectés              ║");
            console.log("║  ➡️  Connecter un appareil            ║");
            console.log("║  ➡️  Connecter avec numéro            ║");
            console.log("║  ➡️  Collez le code ci-dessus         ║");
            console.log("╚══════════════════════════════════════╝\n");

            pendingCodeToSend = code;
        } catch (error) {
            console.error("❌ Erreur AVANCODE pairing : ", error);
        }
    }

    // 💾 Sauvegarde des credentials
    sock.ev.on('creds.update', saveCreds);

    // 🔌 Gestion de la connexion
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            console.log('🚀 Bot connecté ! Protections, stats et stickers actifs.');

            // Envoyer le code AVANCODE par WhatsApp après connexion ouverte
            if (pendingCodeToSend && !codeSent) {
                codeSent = true;
                sendPairingCodeWhatsApp(sock, pendingCodeToSend, config.botNumber).then(() => {
                    pendingCodeToSend = null;
                }).catch(err => {
                    console.error("❌ Erreur envoi WhatsApp:", err.message);
                });
            }
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log("🔄 Reconnexion en cours...");
                pairingCodeAttempted = false;
                setTimeout(() => startBot(), 5000);
            } else {
                console.log("❌ Bot déconnecté définitivement.");
            }
        }
    });

    // 💬 Gestion des messages + PROTECTIONS + STATS + STICKERS
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;

        const config = getConfig();
        const isFromMe = msg.key.fromMe;
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;

        // 🚫 VÉRIFICATION BAN
        if (isBanned(sender) && !isFromMe) return;

        // Mode privé
        if (config.mode === 'private' && !isFromMe) return;

        // Détection du type de message
        const messageType = Object.keys(msg.message)[0];
        const msgType = getMessageType(msg);
        const text = extractText(msg);

        // 📦 TRACKING DES STICKERS
        if (messageType === 'stickerMessage') {
            try {
                const stream = await downloadContentFromMessage(msg.message.stickerMessage, 'sticker');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                let chatName = from;
                if (from.endsWith('@g.us')) {
                    try {
                        const meta = await sock.groupMetadata(from);
                        chatName = meta.subject;
                    } catch (e) {}
                } else {
                    chatName = msg.pushName || from.split('@')[0];
                }

                saveSticker(from, buffer, {
                    name: chatName,
                    type: from.endsWith('@g.us') ? 'group' : 'private',
                    sender: sender
                });
            } catch (error) {
                console.error("Erreur track sticker:", error);
            }
        }

        // 📊 TRACKING DES STATS (uniquement dans les groupes)
        if (from.endsWith('@g.us')) {
            trackMessage(from, sender, { text, type: msgType });
        }

        // 👁️ AUTOREAD + ⌨️ AUTOTYPE
        if (from.endsWith('@g.us') && !isFromMe) {
            const settings = getGroupSettings(from);
            if (settings.autoread) {
                try { await sock.readMessages([msg.key]); } catch (e) {}
            }
            if (settings.autotype) {
                try { await sock.sendPresenceUpdate('composing', from); } catch (e) {}
            }
        }

        // 🛡️ PROTECTIONS (uniquement dans les groupes, pas pour le bot ou les admins)
        if (from.endsWith('@g.us') && !isFromMe) {
            const settings = getGroupSettings(from);

            // Vérifie si l'expéditeur est admin
            let isAdmin = false;
            try {
                const metadata = await sock.groupMetadata(from);
                const senderInfo = metadata.participants.find(p => p.id === sender);
                isAdmin = senderInfo && (senderInfo.admin === 'admin' || senderInfo.admin === 'superadmin');
            } catch (e) {}

            // 🔗 ANTILINK
            if (settings.antilink && !isAdmin && containsLink(text)) {
                try {
                    await sock.sendMessage(from, {
                        delete: { remoteJid: from, fromMe: false, id: msg.key.id, participant: sender }
                    });
                    await sock.sendMessage(from, {
                        text: `⚠️ @${sender.split('@')[0]} les liens sont interdits !`,
                        mentions: [sender]
                    });
                } catch (e) {}
                return;
            }

            // 🤬 ANTITOXIC
            if (settings.antitoxic && !isAdmin && containsToxic(text, settings.toxicWords || [])) {
                try {
                    await sock.sendMessage(from, {
                        delete: { remoteJid: from, fromMe: false, id: msg.key.id, participant: sender }
                    });
                    await sock.sendMessage(from, {
                        text: `⚠️ @${sender.split('@')[0]} langage interdit !`,
                        mentions: [sender]
                    });
                } catch (e) {}
                return;
            }

            // 🌊 ANTIFLOOD
            if (settings.antiflood && !isAdmin) {
                if (!messageHistory[from]) messageHistory[from] = {};
                if (!messageHistory[from][sender]) messageHistory[from][sender] = [];

                const now = Date.now();
                messageHistory[from][sender].push(now);
                messageHistory[from][sender] = messageHistory[from][sender].filter(t => now - t < 5000);

                if (messageHistory[from][sender].length > 5) {
                    try {
                        await sock.groupParticipantsUpdate(from, [sender], 'remove');
                        await sock.sendMessage(from, {
                            text: `🌊 @${sender.split('@')[0]} kick pour spam !`,
                            mentions: [sender]
                        });
                    } catch (e) {}
                    messageHistory[from][sender] = [];
                    return;
                }
            }
        }

        // Extraction du texte pour les commandes
        const prefix = config.prefix;
        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // 🎭 Mappage des emojis pour les réactions
        const emojiMap = {
            'antilink': '🔗', 'antibot': '🤖', 'antispam': '🚫', 'antitoxic': '🤬', 'antidelete': '🗑️',
            'add': '➕', 'kick': '👢', 'promote': '⬆️', 'demote': '⬇️', 'admins': '👮', 'warn': '⚠️', 'tag': '🏷️',
            'chatstats': '📉', 'groupanalysts': '🔍', 'mostactive': '🏆', 'msgcount': '🔢', 'wordcloud': '☁️',
            'prefix': '⌨️', 'setname': '✏️', 'setdesc': '📝', 'setpp': '🖼️', 'lock': '🔒', 'unlock': '🔓',
            'autoread': '👁️', 'autotype': '⌨️', 'rsticker': '🎭', 'stlak': '🤳', 'welcome': '👋', 'goodbye': '🚪',
            'ping': '⚡', 'menu': '📜', 'del': '❌', 'ephemeral': '⏳', 'ginfo': 'ℹ️', 'linkgroup': '🔗',
            'list': '📋', 'revoke': '🔄', 'set': '⚙️'
        };
        const reactionEmoji = emojiMap[commandName] || '✅';

        // ⚡ Réaction automatique
        try {
            await sock.sendMessage(from, { react: { text: reactionEmoji, key: msg.key } });
        } catch (e) {
            console.error("Erreur réaction:", e);
        }

        const cmdPath = path.join(__dirname, 'cmd', `${commandName}.js`);

        if (fs.existsSync(cmdPath)) {
            try {
                delete require.cache[require.resolve(cmdPath)];
                const command = require(cmdPath);
                await command.execute(sock, msg, from, args);
            } catch (error) {
                console.error(`Erreur sur ${commandName}:`, error);
                await sock.sendMessage(from, { text: `❌ Erreur lors de l'exécution.` });
            }
        }
    });

    // 🎉 WELCOME / GOODBYE
    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        const settings = getGroupSettings(id);

        if (!settings.welcome && !settings.goodbye) return;

        try {
            const metadata = await sock.groupMetadata(id);
            const groupName = metadata.subject;

            for (let participant of participants) {
                let participantJid = participant;

                if (typeof participant === 'object' && participant !== null) {
                    if (participant.phoneNumber && typeof participant.phoneNumber === 'string') {
                        participantJid = participant.phoneNumber;
                    } else if (participant.id && typeof participant.id === 'string') {
                        participantJid = participant.id;
                    } else {
                        console.log("⚠️ Participant ignoré (format inconnu):", participant);
                        continue;
                    }
                } else if (typeof participant !== 'string') {
                    console.log("⚠️ Participant ignoré (pas une string):", participant);
                    continue;
                }

                const userNumber = participantJid.split('@')[0];
                const mention = `@${userNumber}`;

                if (action === 'add' && settings.welcome) {
                    let welcomeText = `╭───「 *BIENVENUE* 」\n│\n│ 👋 Salut ${mention} !\n│\n│ 🎉 Bienvenue dans *${groupName}*\n│\n│ 📜 Lis la description\n│ 💬 Présente-toi\n│ 🤝 Amuse-toi bien !\n│\n╰──────────────────`;

                    await sock.sendMessage(id, { text: welcomeText, mentions: [participantJid] });
                    await delay(1000);
                }

                if (action === 'remove' && settings.goodbye) {
                    let goodbyeText = `╭───「 *AU REVOIR* 」\n│\n│ 👋 ${mention} a quitté le groupe...\n│\n│ 😢 On va être triste sans toi !\n│\n╰──────────────────`;

                    await sock.sendMessage(id, { text: goodbyeText, mentions: [participantJid] });
                    await delay(1000);
                }
            }
        } catch (error) {
            console.error("Erreur welcome/goodbye:", error);
        }
    });

    // 🗑️ ANTIDELETE
    sock.ev.on('messages.delete', async (data) => {
        const messages = data.messages || [];
        for (const msg of messages) {
            const from = msg.key.remoteJid;
            if (!from || !from.endsWith('@g.us')) continue;

            const settings = getGroupSettings(from);
            if (!settings.antidelete) continue;
            if (msg.key.fromMe) continue;

            try {
                const participant = msg.key.participant;
                if (!participant) continue;
                const userNumber = participant.split('@')[0];

                let text = `🗑️ *MESSAGE SUPPRIMÉ*\n\n`;
                text += `👤 Par : @${userNumber}\n`;

                if (msg.message?.conversation) {
                    text += `💬 Message : ${msg.message.conversation}`;
                } else if (msg.message?.extendedTextMessage?.text) {
                    text += `💬 Message : ${msg.message.extendedTextMessage.text}`;
                } else if (msg.message?.imageMessage?.caption) {
                    text += `🖼️ Image : ${msg.message.imageMessage.caption}`;
                } else {
                    text += `💬 [Type de message non supporté]`;
                }

                await sock.sendMessage(from, { text, mentions: [participant] });
            } catch (e) {
                console.error("Erreur antidelete:", e);
            }
        }
    });
}

// === ENVOI DU CODE AVANCODE PAR WHATSAPP ===

async function sendPairingCodeWhatsApp(sock, code, botNumber) {
    await delay(5000);

    const jid = botNumber + '@s.whatsapp.net';

    const message = `🤖 *AVANCODE - Assistant Bot WhatsApp*\n\nVotre code AVANCODE est :\n\n*${code}*\n\nCe code est valide pendant 3 minutes.\n\nPour vous connecter :\n1. Ouvrez WhatsApp\n2. Allez dans Appareils connectés\n3. Connecter avec numéro de téléphone\n4. Entrez ce code\n\n— AVANI_SOUDI`;

    await sock.sendMessage(jid, { text: message });
    console.log(`✅ Code AVANCODE envoyé par WhatsApp à ${botNumber}`);
}

startBot();
