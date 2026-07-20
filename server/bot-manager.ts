import path from "path";
import fs from "fs";
import { createRequire } from "module";

type LogEntry = { time: string; level: string; message: string };

type BotState = {
  ws: any;
  logs: LogEntry[];
  status: string;
  pairingCode: string | null;
  pairingCodeExpiresAt: number | null;
  codeSent: boolean;
  pairingCodeAttempted: boolean;
  phoneNumber: string | null;
};

const activeBots = new Map<number, BotState>();

// In-memory antiflood tracker
const messageHistory: Record<string, Record<string, number[]>> = {};

function getOrCreateState(userId: number): BotState {
  if (!activeBots.has(userId)) {
    activeBots.set(userId, {
      ws: null,
      logs: [],
      status: "idle",
      pairingCode: null,
      pairingCodeExpiresAt: null,
      codeSent: false,
      pairingCodeAttempted: false,
      phoneNumber: null,
    });
  }
  return activeBots.get(userId)!;
}

export function getBotState(userId: number): BotState {
  return getOrCreateState(userId);
}

export function addLog(userId: number, level: string, message: string) {
  const state = getOrCreateState(userId);
  state.logs.push({ time: new Date().toISOString(), level, message });
  if (state.logs.length > 200) {
    state.logs = state.logs.slice(-200);
  }
}

// === PROTECTION HELPERS ===

function containsLink(text: string): boolean {
  const linkRegex = /(https?:\/\/[^\s]+|chat\.whatsapp\.com\/[^\s]+|wa\.me\/[^\s]+|www\.[^\s]+)/gi;
  return linkRegex.test(text);
}

function containsToxic(text: string, toxicWords: string[]): boolean {
  if (!text || !toxicWords || toxicWords.length === 0) return false;
  const lower = text.toLowerCase();
  return toxicWords.some(word => lower.includes(word.toLowerCase()));
}

function getGroupSettings(groupId: string): any {
  const dbPath = path.join("/tmp", "avancode-bot-db", "groups.json");
  try {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    let db: any = {};
    if (fs.existsSync(dbPath)) {
      db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    } else {
      fs.writeFileSync(dbPath, JSON.stringify({}));
    }
    if (!db[groupId]) {
      db[groupId] = {
        antilink: false, antibot: false, antiflood: false, antitoxic: false,
        antidelete: false, welcome: false, goodbye: false,
        autoread: false, autotype: false,
        toxicWords: ["putain", "merde", "connard", "fdp", "ntm", "salaud"]
      };
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    }
    return db[groupId];
  } catch {
    return {};
  }
}

function saveGroupSettings(groupId: string, settings: any) {
  const dbPath = path.join("/tmp", "avancode-bot-db", "groups.json");
  try {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    let db: any = {};
    if (fs.existsSync(dbPath)) {
      db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    }
    db[groupId] = settings;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  } catch {}
}

// === MAIN FUNCTIONS ===

export async function deployBot(userId: number, phoneNumber: string): Promise<{ success: boolean }> {
  const state = getOrCreateState(userId);

  // Stop existing bot if running
  if (state.status === "connected" || state.status === "connecting") {
    await stopBot(userId);
  }

  state.phoneNumber = phoneNumber;
  state.status = "connecting";
  state.pairingCodeAttempted = false;
  state.codeSent = false;
  state.pairingCode = null;
  state.pairingCodeExpiresAt = null;
  state.logs = [];

  addLog(userId, "info", "Démarrage de la connexion...");

  try {
    const baileys = await import("@whiskeysockets/baileys");
    const pino = await import("pino");

    const { makeWASocket, useMultiFileAuthState, DisconnectReason, downloadContentFromMessage } = baileys;

    const AUTH_DIR = path.join("/tmp", `avancode-auth-${userId}`);
    fs.mkdirSync(AUTH_DIR, { recursive: true });

    const { state: authState, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    const sock = makeWASocket({
      auth: authState,
      logger: pino.default({ level: "silent" }),
      printQRInTerminal: false,
    });

    state.ws = sock;

    // Save credentials
    sock.ev.on("creds.update", saveCreds);

    // === CONNECTION HANDLER ===
    sock.ev.on("connection.update", async (update: any) => {
      const { connection, lastDisconnect } = update;

      if (connection === "connecting") {
        state.status = "connecting";
        addLog(userId, "info", "Connexion en cours...");
      }

      if (connection === "open") {
        state.status = "connected";
        addLog(userId, "success", "Bot connecté avec succès !");

        // Send pairing code via WhatsApp if not sent yet
        if (state.pairingCode && !state.codeSent) {
          state.codeSent = true;
          try {
            const jid = phoneNumber + "@s.whatsapp.net";
            await sock.sendMessage(jid, {
              text: `🤖 *AVANCODE - Assistant Bot WhatsApp*\n\nVotre code AVANCODE est :\n\n*${state.pairingCode}*\n\nCe code est valide pendant 3 minutes.\n\nPour vous connecter :\n1. Ouvrez WhatsApp\n2. Allez dans Appareils connectés\n3. Connecter avec numéro de téléphone\n4. Entrez ce code\n\n— AVANI_SOUDI`,
            });
            addLog(userId, "success", `Code AVANCODE envoyé par WhatsApp à ${phoneNumber}`);
          } catch (e: any) {
            addLog(userId, "error", "Erreur envoi WhatsApp: " + (e.message || e));
          }
        }
      }

      if (connection === "close") {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          state.status = "connecting";
          state.pairingCodeAttempted = true; // Don't request code again on reconnect
          addLog(userId, "warn", "Déconnexion, reconnexion en cours...");
        } else {
          state.status = "idle";
          addLog(userId, "error", "Déconnexion définitive.");
          activeBots.delete(userId);
        }
      }
    });

    // === REQUEST PAIRING CODE (only once per session) ===
    if (!state.pairingCodeAttempted) {
      state.pairingCodeAttempted = true;
      await new Promise(resolve => setTimeout(resolve, 3000));
      try {
        const code = await sock.requestPairingCode(phoneNumber);
        const expiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes

        state.pairingCode = code;
        state.pairingCodeExpiresAt = expiresAt;
        addLog(userId, "info", "Demande du code AVANCODE...");
        addLog(userId, "success", `Code AVANCODE: ${code} (valide 3 min)`);
      } catch (e: any) {
        addLog(userId, "error", "Erreur pairing: " + (e.message || e));
      }
    }

    // === MESSAGE HANDLER WITH COMMANDS + PROTECTIONS ===
    sock.ev.on("messages.upsert", async (m: any) => {
      const msg = m.messages[0];
      if (!msg.message) return;

      const isFromMe = msg.key.fromMe;
      const from = msg.key.remoteJid!;
      const sender = msg.key.participant || from;

      if (isFromMe) return;

      // Extract text and type
      const messageType = Object.keys(msg.message)[0];
      let text = "";
      let msgType = "text";

      if (messageType === "conversation") {
        text = msg.message.conversation;
        msgType = "text";
      } else if (messageType === "extendedTextMessage") {
        text = msg.message.extendedTextMessage.text;
        msgType = "text";
      } else if (messageType === "imageMessage") {
        text = msg.message.imageMessage.caption || "";
        msgType = "image";
      } else if (messageType === "videoMessage") {
        text = msg.message.videoMessage.caption || "";
        msgType = "video";
      } else if (messageType === "stickerMessage") {
        msgType = "sticker";
      } else if (messageType === "audioMessage") {
        msgType = msg.message.audioMessage.ptt ? "voice" : "audio";
      }

      // === STICKER TRACKING ===
      if (msgType === "sticker") {
        try {
          const stickersDir = path.join("/tmp", "avancode-bot-db", "stickers");
          const chatDir = path.join(stickersDir, from.replace(/[^a-zA-Z0-9]/g, "_"));
          fs.mkdirSync(chatDir, { recursive: true });
          const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}.webp`;
          const filepath = path.join(chatDir, filename);
          const stream = await downloadContentFromMessage(msg.message.stickerMessage, "sticker");
          let buffer = Buffer.from([]);
          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
          }
          fs.writeFileSync(filepath, buffer);

          // Index
          const indexPath = path.join(stickersDir, "index.json");
          let index: any = {};
          if (fs.existsSync(indexPath)) {
            index = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
          }
          if (!(index as any)[from]) {
            (index as any)[from] = { name: from, type: from.endsWith("@g.us") ? "group" : "private", stickers: [] };
          }
          (index as any)[from].stickers.push({ filename, filepath, savedAt: Date.now(), sender });
          fs.mkdirSync(path.dirname(indexPath), { recursive: true });
          fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
          addLog(userId, "info", `Sticker sauvegardé de ${sender.split("@")[0]}`);
        } catch (e) {}
      }

      // === GROUP PROTECTIONS ===
      if (from.endsWith("@g.us") && !isFromMe) {
        const settings = getGroupSettings(from);

        // Check if sender is admin
        let isAdmin = false;
        try {
          const metadata = await sock.groupMetadata(from);
          const senderInfo = metadata.participants.find((p: any) => p.id === sender);
          isAdmin = !!(senderInfo && (senderInfo.admin === "admin" || senderInfo.admin === "superadmin"));
        } catch (e) {}

        // AUTOREAD
        if (settings.autoread) {
          try { await sock.readMessages([msg.key]); } catch (e) {}
        }

        // AUTOTYPE
        if (settings.autotype) {
          try { await sock.sendPresenceUpdate("composing", from); } catch (e) {}
        }

        // ANTILINK
        if (settings.antilink && !isAdmin && containsLink(text)) {
          try {
            await sock.sendMessage(from, {
              delete: { remoteJid: from, fromMe: false, id: msg.key.id, participant: sender }
            });
            await sock.sendMessage(from, {
              text: `⚠️ @${sender.split("@")[0]} les liens sont interdits !`,
              mentions: [sender]
            });
          } catch (e) {}
          addLog(userId, "warn", `Antilink: lien bloqué de ${sender.split("@")[0]}`);
          return;
        }

        // ANTITOXIC
        if (settings.antitoxic && !isAdmin && containsToxic(text, settings.toxicWords || [])) {
          try {
            await sock.sendMessage(from, {
              delete: { remoteJid: from, fromMe: false, id: msg.key.id, participant: sender }
            });
            await sock.sendMessage(from, {
              text: `⚠️ @${sender.split("@")[0]} langage interdit !`,
              mentions: [sender]
            });
          } catch (e) {}
          addLog(userId, "warn", `Antitoxic: mot bloqué de ${sender.split("@")[0]}`);
          return;
        }

        // ANTIFLOOD
        if (settings.antiflood && !isAdmin) {
          if (!messageHistory[from]) messageHistory[from] = {};
          if (!messageHistory[from][sender]) messageHistory[from][sender] = [];

          const now = Date.now();
          messageHistory[from][sender].push(now);
          messageHistory[from][sender] = messageHistory[from][sender].filter(t => now - t < 5000);

          if (messageHistory[from][sender].length > 5) {
            try {
              await sock.groupParticipantsUpdate(from, [sender], "remove");
              await sock.sendMessage(from, {
                text: `🌊 @${sender.split("@")[0]} kick pour spam !`,
                mentions: [sender]
              });
            } catch (e) {}
            messageHistory[from][sender] = [];
            addLog(userId, "warn", `Antiflood: ${sender.split("@")[0]} kické pour spam`);
            return;
          }
        }
      }

      // === COMMAND PROCESSING ===
      if (!text || !text.startsWith(".")) return;

      const args = text.slice(1).trim().split(/ +/);
      const commandName = args.shift()?.toLowerCase();
      if (!commandName) return;

      // Reaction
      const emojiMap: Record<string, string> = {
        antilink: "🔗", antibot: "🤖", antispam: "🚫", antitoxic: "🤬", antidelete: "🗑️",
        add: "➕", kick: "👢", promote: "⬆️", demote: "⬇️", admins: "👮", warn: "⚠️", tag: "🏷️",
        chatstats: "📉", groupanalysts: "🔍", mostactive: "🏆", msgcount: "🔢", wordcloud: "☁️",
        ping: "⚡", menu: "📜", del: "❌",
      };
      const reactionEmoji = emojiMap[commandName] || "✅";

      try {
        await sock.sendMessage(from, { react: { text: reactionEmoji, key: msg.key } });
      } catch (e) {}

      // Load and execute command
      const cmdDir = path.join(__dirname, "..", "bot-commands", "cmd");
      const cmdPath = path.join(cmdDir, `${commandName}.js`);

      if (fs.existsSync(cmdPath)) {
        try {
          const require = createRequire(cmdPath);
          const command = require(cmdPath);
          await command.execute(sock, msg, from, args);
          addLog(userId, "info", `Commande .${commandName} exécutée`);
        } catch (e: any) {
          addLog(userId, "error", `Erreur commande .${commandName}: ${e.message}`);
          try {
            await sock.sendMessage(from, { text: "❌ Erreur lors de l'exécution de la commande." });
          } catch (e2) {}
        }
      } else {
        addLog(userId, "info", `Commande inconnue: .${commandName}`);
      }
    });

    // === GROUP PARTICIPANTS (WELCOME/GOODBYE) ===
    sock.ev.on("group-participants.update", async (update: any) => {
      const { id, participants, action } = update;

      for (const participant of participants) {
        let participantJid = "";
        if (typeof participant === "string") {
          participantJid = participant;
        } else if (participant?.id) {
          participantJid = participant.id;
        } else if (participant?.phoneNumber) {
          participantJid = participant.phoneNumber;
        } else {
          continue;
        }

        const userNumber = participantJid.split("@")[0];
        const mention = `@${userNumber}`;
        const settings = getGroupSettings(id);

        if (action === "add" && settings.welcome) {
          try {
            await sock.sendMessage(id, {
              text: `╭───「 *BIENVENUE* 」\n│\n│ 👋 Salut ${mention} !\n│\n│ 🎉 Bienvenue !\n│\n╰──────────────────`,
              mentions: [participantJid],
            });
            addLog(userId, "info", `Welcome: ${userNumber} rejoint`);
          } catch (e) {}
        }

        if (action === "remove" && settings.goodbye) {
          try {
            await sock.sendMessage(id, {
              text: `╭───「 *AU REVOIR* 」\n│\n│ 👋 ${mention} a quitté...\n│\n╰──────────────────`,
              mentions: [participantJid],
            });
            addLog(userId, "info", `Goodbye: ${userNumber} a quitté`);
          } catch (e) {}
        }
      }
    });

    // === ANTIDELETE ===
    sock.ev.on("messages.delete", async (data: any) => {
      const messages = data.messages || [];
      for (const msg of messages) {
        const from = msg.key.remoteJid;
        if (!from || !from.endsWith("@g.us")) continue;
        if (msg.key.fromMe) continue;

        const settings = getGroupSettings(from);
        if (!settings.antidelete) continue;

        try {
          const participant = msg.key.participant;
          if (!participant) continue;
          const userNumber = participant.split("@")[0];

          let text = `🗑️ *MESSAGE SUPPRIMÉ*\n\n👤 Par : @${userNumber}\n`;

          if (msg.message?.conversation) {
            text += `💬 Message : ${msg.message.conversation}`;
          } else if (msg.message?.extendedTextMessage?.text) {
            text += `💬 Message : ${msg.message.extendedTextMessage.text}`;
          } else if (msg.message?.imageMessage?.caption) {
            text += `🖼️ Image : ${msg.message.imageMessage.caption}`;
          }

          await sock.sendMessage(from, { text, mentions: [participant] });
          addLog(userId, "info", `Antidelete: message de ${userNumber}`);
        } catch (e) {}
      }
    });

    return { success: true };
  } catch (error: any) {
    state.status = "error";
    addLog(userId, "error", `Erreur: ${error.message || String(error)}`);
    return { success: false };
  }
}

export async function stopBot(userId: number): Promise<void> {
  const state = getOrCreateState(userId);

  if (state.ws) {
    try {
      state.ws.end(undefined);
    } catch (e) {}
    state.ws = null;
  }

  state.status = "idle";
  state.pairingCode = null;
  state.pairingCodeExpiresAt = null;
  state.codeSent = false;
  state.pairingCodeAttempted = false;
  addLog(userId, "info", "Bot arrêté par l'utilisateur.");

  // Clean auth directory
  try {
    const AUTH_DIR = path.join("/tmp", `avancode-auth-${userId}`);
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
  } catch (e) {}
}

export function getBotStatus(userId: number) {
  const state = getOrCreateState(userId);
  return {
    status: state.status,
    pairingCode: state.pairingCode,
    pairingCodeExpiresAt: state.pairingCodeExpiresAt,
    logs: state.logs.slice(-50),
    phoneNumber: state.phoneNumber,
  };
}

export function clearLogs(userId: number) {
  const state = getOrCreateState(userId);
  state.logs = [];
}

export { activeBots };
