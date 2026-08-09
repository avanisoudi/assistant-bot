const { makeWASocket, useMultiFileAuthState, DisconnectReason, delay, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const { detectLinks } = require('./lib/antilink');
const { addWarning, muteUser, isMuted, resetWarnings, logLinkAttempt } = require('./lib/sanctions');
const { checkAdmin } = require('./lib/adminCheck');

const configPath = path.join(__dirname, 'config.json');
const imgFolder = path.join(__dirname, 'img');
const bannedPath = path.join(__dirname, 'banned.json');
const stickersDir = path.join(__dirname, 'db', 'stickers');
const stickersIndex = path.join(stickersDir, 'index.json');

// 📋 Recharge la config à chaque commande (permet de changer le préfixe sans redémarrer)
function getConfig() {
    delete require.cache[require.resolve(configPath)];
    return require(configPath);
}

// 🖼️ Récupère une image aléatoire dans le dossier img/
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

// 🔗 Détecte les liens dans un texte (détection avancée : http, domaines nus, liens obfusqués, WhatsApp)
function containsLink(text) {
    return detectLinks(text).hasLink;
}

// 🤬 Détecte les mots toxiques
function containsToxic(text, toxicWords) {
    if (!text || !toxicWords || toxicWords.length === 0) return false;
    const lower = text.toLowerCase();
    return toxicWords.some(word => lower.includes(word.toLowerCase()));
}

// 📊 Charge les settings d'un groupe (protections)
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
            antispam: false,
            antitoxic: false,
            antidelete: false,
            antivideo: false,
            antiaudio: false,
            antiimage: false,
            antisticker: false,
            antitag: false,
            antiforbidden: false,
            antidemote: false,
            antipromote: false,
            antipurge: false,
            antistatut: false,
            antitransfer: false,
            antiviewonce: false,
            rules: '',
            mode: 'public',
            filters: [],
            welcome: false,
            goodbye: false,
            autoread: false,
            autotype: false,
            toxicWords: ['putain', 'merde', 'connard', 'fdp', 'ntm', 'salaud'],
            forbiddenWords: []
        };
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    }
    // Complète les champs manquants pour les groupes existants créés avant cette version
    const defaults = { antispam: false, antivideo: false, antiaudio: false, antiimage: false, antisticker: false, antitag: false, antiforbidden: false, antidemote: false, antipromote: false, antipurge: false, antistatut: false, antitransfer: false, antiviewonce: false, rules: '', mode: 'public', filters: [], forbiddenWords: [] };
    let changed = false;
    for (const [key, val] of Object.entries(defaults)) {
        if (!(key in db[groupId])) { db[groupId][key] = val; changed = true; }
    }
    if (changed) fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return db[groupId];
}

// 💾 Sauvegarde les settings d'un groupe
function setGroupSettingLocal(groupId, key, value) {
    const dbPath = path.join(__dirname, 'db', 'groups.json');
    let db = {};
    if (fs.existsSync(dbPath)) {
        try { db = JSON.parse(fs.readFileSync(dbPath, 'utf-8')); } catch (e) { db = {}; }
    }
    if (!db[groupId]) db[groupId] = {};
    db[groupId][key] = value;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
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

    // Limite à 100 users les plus actifs
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

// 👁️ Détecte un média envoyé en "vue unique" (viewOnceMessage / viewOnceMessageV2, ou flag viewOnce direct)
function getViewOnceContent(msg) {
    const m = msg.message;
    if (!m) return null;
    if (m.viewOnceMessage?.message) return m.viewOnceMessage.message;
    if (m.viewOnceMessageV2?.message) return m.viewOnceMessageV2.message;
    if (m.viewOnceMessageV2Extension?.message) return m.viewOnceMessageV2Extension.message;
    if (m.imageMessage?.viewOnce) return { imageMessage: m.imageMessage };
    if (m.videoMessage?.viewOnce) return { videoMessage: m.videoMessage };
    return null;
}

// Stockage antiflood (en mémoire)
const messageHistory = {};
const spamHistory = {};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
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
    if (!sock.authState.creds.registered) {
        await delay(3000);
        const config = getConfig();
        console.log("\n╔══════════════════════════════════════╗");
        console.log("║     🤖 AVANCODE - Assistant Bot      ║");
        console.log("╠══════════════════════════════════════╣");
        try {
            const code = await sock.requestPairingCode(config.botNumber);
            console.log(`║  👉 Code de jumelage : [ ${code} ]  ║`);
            console.log("╠══════════════════════════════════════╣");
            console.log("║  📱 Ouvrez WhatsApp                  ║");
            console.log("║  ➡️  Appareils connectés              ║");
            console.log("║  ➡️  Connecter un appareil            ║");
            console.log("║  ➡️  Connecter avec numéro            ║");
            console.log("║  ➡️  Collez le code ci-dessus         ║");
            console.log("╚══════════════════════════════════════╝\n");
        } catch (error) {
            console.error("❌ Erreur AVANCODE pairing : ", error);
        }
    }

    // 💾 Sauvegarde des credentials
    sock.ev.on('creds.update', saveCreds);

    // 🔌 Gestion de la connexion
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('🚀 Bot connecté ! Protections, stats et stickers actifs.');

            // 🎉 Message de connexion réussie, envoyé automatiquement aux administrateurs du bot
            (async () => {
                try {
                    const { notifyBotAdmins } = require('./lib/botAdmins');
                    const cmdCount = fs.readdirSync(path.join(__dirname, 'cmd')).filter(f => f.endsWith('.js')).length;
                    const deployMessage = `╔═══════════════════╗
   🥳 *Bot connecté !*
╚═══════════════════╝

✅ AssistantBot V1.1.9
📊 ${cmdCount} commandes
📅 ${new Date().toLocaleDateString('fr-FR')}

💡 .menu pour tout voir`;

                    await notifyBotAdmins(sock, { text: deployMessage });
                } catch (e) {
                    console.error('Erreur envoi message de connexion:', e.message);
                }
            })();
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

                // Détermine le nom du chat
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

            // Vérifie si l'expéditeur est admin (tolérant au système LID de WhatsApp)
            let isAdmin = false;
            try {
                const result = await checkAdmin(sock, from, msg);
                isAdmin = result.isAdmin;
            } catch (e) { console.error('Erreur checkAdmin middleware:', e); }

            // 🔒 MODE PRIVÉ (seuls les admins peuvent utiliser les commandes du bot)
            if (settings.mode === 'private' && !isAdmin && text.startsWith(config.prefix)) {
                return;
            }

            // 📝 FILTER (mots personnalisés interdits, distinct d'antiforbidden : suppression silencieuse)
            if ((settings.filters || []).length > 0 && !isAdmin) {
                const lower = text.toLowerCase();
                if (settings.filters.some(w => lower.includes(w))) {
                    try {
                        await sock.sendMessage(from, {
                            delete: { remoteJid: from, fromMe: false, id: msg.key.id, participant: sender }
                        });
                    } catch (e) {}
                    return;
                }
            }

            // 🔗 ANTILINK (avec sanctions progressives : avertissement → mute 1h → expulsion)
            if (settings.antilink && !isAdmin && containsLink(text)) {
                // La suppression est "best effort" : si le bot n'est pas admin du groupe,
                // elle échoue — mais ça ne doit JAMAIS empêcher l'avertissement et le
                // comptage de sanctions de s'exécuter quand même (avant, une suppression
                // impossible annulait silencieusement tout le reste du bloc).
                let deleted = false;
                try {
                    await sock.sendMessage(from, {
                        delete: { remoteJid: from, fromMe: false, id: msg.key.id, participant: sender }
                    });
                    deleted = true;
                } catch (e) {
                    console.error('Erreur suppression antilink (le bot est-il admin du groupe ?):', e.message);
                }

                try {
                    const detected = detectLinks(text);
                    logLinkAttempt(from, sender, detected.links, detected.types);
                    const { count, action } = addWarning(from, sender, 'antilink');
                    const notice = deleted ? '' : '\n⚠️ (Je n\'ai pas pu supprimer le message : je dois être admin du groupe)';

                    if (action === 'kick') {
                        await sock.groupParticipantsUpdate(from, [sender], 'remove');
                        resetWarnings(from, sender);
                        await sock.sendMessage(from, { text: `🔨 @${sender.split('@')[0]} expulsé (4 liens envoyés malgré les avertissements)${notice}`, mentions: [sender] });
                    } else if (action === 'mute_1h') {
                        muteUser(from, sender, 60 * 60 * 1000);
                        await sock.sendMessage(from, { text: `🔇 @${sender.split('@')[0]} mis en sourdine 1h (3e lien envoyé, avertissement ${count}/4)${notice}`, mentions: [sender] });
                    } else {
                        await sock.sendMessage(from, { text: `⚠️ @${sender.split('@')[0]} les liens sont interdits ! (avertissement ${count}/4)${notice}`, mentions: [sender] });
                    }
                } catch (e) { console.error('Erreur antilink (avertissement):', e); }
                return;
            }

            // 🔇 Bloque les messages des utilisateurs actuellement mute par le système de sanctions (ex: après 3 liens)
            if (isMuted(from, sender) && !isAdmin) {
                try {
                    await sock.sendMessage(from, {
                        delete: { remoteJid: from, fromMe: false, id: msg.key.id, participant: sender }
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

            // 👁️ ANTIVIEWONCE (capture et republie les médias envoyés en vue unique)
            if (settings.antiviewonce && !isAdmin) {
                const viewOnceContent = getViewOnceContent(msg);
                if (viewOnceContent) {
                    try {
                        const mediaType = viewOnceContent.imageMessage ? 'image' : viewOnceContent.videoMessage ? 'video' : null;
                        if (mediaType) {
                            const stream = await downloadContentFromMessage(viewOnceContent[`${mediaType}Message`], mediaType);
                            let buffer = Buffer.from([]);
                            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

                            const caption = `👁️ Média vue-unique de @${sender.split('@')[0]} republié automatiquement (antiviewonce activé)`;
                            if (mediaType === 'image') {
                                await sock.sendMessage(from, { image: buffer, caption, mentions: [sender] });
                            } else {
                                await sock.sendMessage(from, { video: buffer, caption, mentions: [sender] });
                            }
                        }
                    } catch (e) { console.error('Erreur antiviewonce:', e); }
                    return;
                }
            }

            // 🖼️ ANTIIMAGE / 🎥 ANTIVIDEO / 🔊 ANTIAUDIO / 🎭 ANTISTICKER
            const mediaSettingMap = { image: 'antiimage', video: 'antivideo', audio: 'antiaudio', voice: 'antiaudio', sticker: 'antisticker' };
            const mediaSetting = mediaSettingMap[msgType];
            if (mediaSetting && settings[mediaSetting] && !isAdmin) {
                try {
                    await sock.sendMessage(from, {
                        delete: { remoteJid: from, fromMe: false, id: msg.key.id, participant: sender }
                    });
                    await sock.sendMessage(from, {
                        text: `⚠️ @${sender.split('@')[0]} ce type de contenu est désactivé ici (${mediaSetting})`,
                        mentions: [sender]
                    });
                } catch (e) {}
                return;
            }

            // 🏷️ ANTITAG (spam de mentions)
            const mentionCount = (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []).length;
            if (settings.antitag && !isAdmin && mentionCount >= 5) {
                try {
                    await sock.sendMessage(from, {
                        delete: { remoteJid: from, fromMe: false, id: msg.key.id, participant: sender }
                    });
                    await sock.sendMessage(from, {
                        text: `⚠️ @${sender.split('@')[0]} évite de mentionner autant de personnes d'un coup !`,
                        mentions: [sender]
                    });
                } catch (e) {}
                return;
            }

            // 🚯 ANTIFORBIDDEN (mots interdits personnalisés du groupe)
            if (settings.antiforbidden && !isAdmin && containsToxic(text, settings.forbiddenWords || [])) {
                try {
                    await sock.sendMessage(from, {
                        delete: { remoteJid: from, fromMe: false, id: msg.key.id, participant: sender }
                    });
                    await sock.sendMessage(from, {
                        text: `⚠️ @${sender.split('@')[0]} ce mot est interdit dans ce groupe !`,
                        mentions: [sender]
                    });
                } catch (e) {}
                return;
            }

            // 🚫 ANTISPAM (protection légère : avertit + supprime, sans kick, contrairement à antiflood)
            if (settings.antispam && !isAdmin) {
                if (!spamHistory[from]) spamHistory[from] = {};
                if (!spamHistory[from][sender]) spamHistory[from][sender] = [];
                const now = Date.now();
                spamHistory[from][sender].push(now);
                spamHistory[from][sender] = spamHistory[from][sender].filter(t => now - t < 10000);
                if (spamHistory[from][sender].length > 8) {
                    try {
                        await sock.sendMessage(from, {
                            text: `🚫 @${sender.split('@')[0]} ralentis un peu, tu envoies trop de messages !`,
                            mentions: [sender]
                        });
                    } catch (e) {}
                    spamHistory[from][sender] = [];
                }
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

        // 🔇 MUTEGLOBAL : si actif, seuls les administrateurs du bot peuvent utiliser des commandes
        if (commandName !== 'muteglobal') {
            try {
                const globalMutePath = path.join(__dirname, 'db', 'globalMute.json');
                if (fs.existsSync(globalMutePath)) {
                    const globalMuteState = JSON.parse(fs.readFileSync(globalMutePath, 'utf-8'));
                    if (globalMuteState.muted) {
                        const { isBotAdmin } = require('./lib/botAdmins');
                        if (!isBotAdmin(sender)) return;
                    }
                }
            } catch (e) {}
        }

        const cmdPath = path.join(__dirname, 'cmd', `${commandName}.js`);
        const commandExists = fs.existsSync(cmdPath);

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
        // ❓ si la commande n'existe pas, sinon l'emoji dédié ou ✅ par défaut
        const reactionEmoji = !commandExists ? '❓' : (emojiMap[commandName] || '✅');

        // ⚡ Réaction automatique
        try {
            await sock.sendMessage(from, { react: { text: reactionEmoji, key: msg.key } });
        } catch (e) {
            console.error("Erreur réaction:", e);
        }

        if (commandExists) {
            try {
                delete require.cache[require.resolve(cmdPath)];
                const command = require(cmdPath);
                await command.execute(sock, msg, from, args);

                // 🧹 Auto-suppression du message de commande après 4s dans les groupes,
                // pour ne pas encombrer le chat. Best-effort : silencieux si le bot
                // n'est pas admin (WhatsApp exige ce droit pour supprimer un message
                // qui n'est pas le sien).
                if (from.endsWith('@g.us')) {
                    setTimeout(async () => {
                        try {
                            await sock.sendMessage(from, {
                                delete: { remoteJid: from, fromMe: false, id: msg.key.id, participant: sender }
                            });
                        } catch (e) {}
                    }, 4000);
                }
            } catch (error) {
                console.error(`Erreur sur ${commandName}:`, error);
                await sock.sendMessage(from, { text: `❌ Erreur lors de l'exécution.` });
            }
        }

        // 🥳 RÉACTION AUTOMATIQUE SUR CHAÎNE (une seule réaction aléatoire par publication)
        if (from.includes('@broadcast') || from.includes('status@broadcast')) {
            try {
                const emojisToReact = ['🥳', '⭐', '❤️', '💙', '✅', '🤍', '💖', '🎉', '🎊'];
                const emoji = emojisToReact[Math.floor(Math.random() * emojisToReact.length)];
                await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
            } catch (e) {
                console.error('Erreur réaction chaîne:', e);
            }
        }
    });

    // 🎉 WELCOME / GOODBYE / ANTIBOT
    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        const settings = getGroupSettings(id);

        // 🤖 ANTIBOT : expulse automatiquement les numéros de la liste noire (db/botNumbers.json)
        // Limitation honnête : WhatsApp ne permet pas de détecter à coup sûr qu'un compte est un bot.
        // Ce système expulse les numéros que les admins ont explicitement blacklistés avec .blacklistbot.
        if (settings.antibot && action === 'add') {
            try {
                const blacklistPath = path.join(__dirname, 'db', 'botNumbers.json');
                const blacklist = fs.existsSync(blacklistPath) ? JSON.parse(fs.readFileSync(blacklistPath, 'utf-8')) : [];
                for (const p of participants) {
                    const jid = typeof p === 'string' ? p : (p.id || p.phoneNumber);
                    if (jid && blacklist.includes(jid)) {
                        await sock.groupParticipantsUpdate(id, [jid], 'remove');
                        await sock.sendMessage(id, { text: `🤖 @${jid.split('@')[0]} a été expulsé automatiquement (numéro blacklisté antibot)`, mentions: [jid] });
                    }
                }
            } catch (e) {
                console.error('Erreur antibot:', e);
            }
        }

        // 🎯 MISSION : récompense de 600 coins pour avoir ajouté un membre au groupe.
        // Limitation honnête : Baileys ne fournit un "author" fiable que lorsque
        // quelqu'un ajoute activement un membre (via le menu "Ajouter des membres").
        // Si la personne rejoint elle-même via un lien d'invitation, il n'y a pas de
        // vrai "ajouteur" à récompenser — aucun coin n'est alors distribué.
        if (action === 'add' && update.author) {
            try {
                const { addCoins } = require('./lib/economy');
                const authorNorm = update.author.split('@')[0].split(':')[0];
                for (const p of participants) {
                    const jid = typeof p === 'string' ? p : (p.id || p.phoneNumber);
                    const jidNorm = jid ? jid.split('@')[0].split(':')[0] : null;
                    if (jidNorm && jidNorm === authorNorm) continue; // auto-join, pas de récompense
                    addCoins(update.author, 600);
                    await sock.sendMessage(id, {
                        text: `🎯 @${update.author.split('@')[0]} a ajouté un membre au groupe !\n💰 +600 coins (mission)`,
                        mentions: [update.author]
                    });
                    break; // une seule récompense par événement, même si plusieurs personnes ajoutées d'un coup
                }
            } catch (e) {
                console.error('Erreur mission:', e);
            }
        }


        // ⬆️⬇️ ANTIPROMOTE / ANTIDEMOTE : notifie le groupe (audit) — WhatsApp ne permet pas d'identifier l'auteur du changement ni de le bloquer côté bot
        if ((action === 'promote' && settings.antipromote) || (action === 'demote' && settings.antidemote)) {
            try {
                for (const p of participants) {
                    const jid = typeof p === 'string' ? p : (p.id || p.phoneNumber);
                    if (!jid) continue;
                    const label = action === 'promote' ? '⬆️ promu admin' : '⬇️ rétrogradé';
                    await sock.sendMessage(id, { text: `🔔 @${jid.split('@')[0]} a été ${label}`, mentions: [jid] });
                }
            } catch (e) { console.error('Erreur notif promote/demote:', e); }
        }

        if (!settings.welcome && !settings.goodbye) return;

        try {
            const metadata = await sock.groupMetadata(id);
            const groupName = metadata.subject;

            for (let participant of participants) {
                // ✅ GESTION DES OBJETS LID : Baileys renvoie parfois des objets
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

startBot();