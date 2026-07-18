const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');
const { makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const AUTH_DIR = path.join(__dirname, 'auth_info');

// === CONFIGURATION ===
// Le pairing code WhatsApp dure ~2min par défaut.
// On stocke le code pendant 10 minutes (600 000 ms) côté serveur
// pour éviter qu'il n'expire avant que l'utilisateur ne le saisisse.
const PAIRING_CODE_TTL = 10 * 60 * 1000; // 10 minutes en millisecondes

// État du bot
let botState = {
    status: 'offline', // offline, connecting, online
    pairingCode: null,
    pairingCodeExpiry: null, // Timestamp d'expiration du code
    phoneNumber: null,
    logs: []
};
let sock = null;
let pairingCodeAttempted = false; // Flag : on ne demande le code qu'une seule fois par session
let pendingCodeToSend = null; // Code en attente d'envoi après connexion établie
let codeSent = false; // Flag : le code a déjà été envoyé

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === API ROUTES ===

// Statut du bot
app.get('/api/status', (req, res) => {
    res.json({
        status: botState.status,
        pairingCode: botState.pairingCode,
        pairingCodeExpiry: botState.pairingCodeExpiry,
        phoneNumber: botState.phoneNumber,
        logs: botState.logs.slice(-50)
    });
});

// Déployer le bot
app.post('/api/deploy', async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
        return res.status(400).json({ error: 'Numéro de téléphone requis' });
    }

    if (botState.status === 'online' || botState.status === 'connecting') {
        return res.status(400).json({ error: 'Le bot est déjà en cours de connexion ou en ligne' });
    }

    botState.phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    botState.status = 'connecting';
    botState.pairingCode = null;
    botState.pairingCodeExpiry = null;
    pairingCodeAttempted = false; // Reset le flag pour une nouvelle tentative
    codeSent = false;
    addLog('info', 'Démarrage de la connexion...');
    broadcast({ type: 'status', data: botState });

    try {
        await startBot();
        res.json({ success: true, message: 'Connexion en cours...' });
    } catch (error) {
        addLog('error', 'Erreur: ' + error.message);
        botState.status = 'offline';
        broadcast({ type: 'status', data: botState });
        res.status(500).json({ error: error.message });
    }
});

// Arrêter le bot
app.post('/api/stop', (req, res) => {
    try {
        if (sock) {
            sock.end();
            sock = null;
        }
        botState.status = 'offline';
        botState.pairingCode = null;
        botState.pairingCodeExpiry = null;
        pairingCodeAttempted = false;
        pendingCodeToSend = null;
        codeSent = false;
        addLog('info', 'Bot arrêté.');
        broadcast({ type: 'status', data: botState });
        res.json({ success: true, message: 'Bot arrêté' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === FONCTIONS BOT ===

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['AVANCODE', 'Chrome', '120.0.0']
    });

    // Sauvegarde credentials
    sock.ev.on('creds.update', saveCreds);

    // Pairing Code — demandé UNE SEULE FOIS par session de déploiement
    if (!sock.authState.creds.registered && !pairingCodeAttempted) {
        pairingCodeAttempted = true;
        await delay(3000);
        addLog('info', 'Demande du code AVANCODE...');
        try {
            const code = await sock.requestPairingCode(botState.phoneNumber);
            botState.pairingCode = code;
            botState.pairingCodeExpiry = Date.now() + PAIRING_CODE_TTL; // expire dans 10 min
            pendingCodeToSend = code; // Stocker le code pour envoi après connexion
            addLog('success', 'Code AVANCODE: ' + code + ' (valide 10 min)');
            broadcast({ type: 'pairing', data: { code, expiry: botState.pairingCodeExpiry } });
            broadcast({ type: 'status', data: botState });
        } catch (error) {
            addLog('error', 'Erreur pairing: ' + error.message);
            broadcast({ type: 'status', data: botState });
        }
    }

    // Connexion
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            botState.status = 'online';
            addLog('success', 'Bot connecté avec succès !');
            broadcast({ type: 'status', data: botState });

            // Envoyer le code AVANCODE par WhatsApp maintenant que la connexion est ouverte
            if (pendingCodeToSend && !codeSent) {
                codeSent = true;
                sendPairingCodeWhatsApp(pendingCodeToSend).then(() => {
                    pendingCodeToSend = null;
                }).catch(err => {
                    addLog('warn', 'Erreur envoi WhatsApp: ' + err.message);
                    addLog('info', 'Le code est affiché dans le panneau web. Saisissez-le manuellement.');
                });
            }
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect && botState.status !== 'offline') {
                addLog('warn', 'Déconnexion, reconnexion en cours...');
                botState.status = 'connecting';
                broadcast({ type: 'status', data: botState });
                // Reconnexion : on ne redemande PAS le pairing code
                setTimeout(() => startBot(), 5000);
            } else {
                botState.status = 'offline';
                botState.pairingCode = null;
                botState.pairingCodeExpiry = null;
                pairingCodeAttempted = false;
                pendingCodeToSend = null;
                addLog('info', 'Bot déconnecté.');
                broadcast({ type: 'status', data: botState });
            }
        }
    });

    // Messages reçus
    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
            if (!msg.key.fromMe && msg.message) {
                const sender = msg.key.remoteJid;
                const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
                if (text) {
                    addLog('msg', `${sender.split('@')[0]}: ${text.substring(0, 50)}`);
                }
            }
        }
    });
}

// === ENVOI DU CODE AVANCODE PAR WHATSAPP ===

async function sendPairingCodeWhatsApp(code) {
    // Le socket doit être dans l'état "open" pour envoyer un message
    // On attend un court délai pour être sûr que le socket est pleinement initialisé
    await delay(5000);

    const jid = botState.phoneNumber + '@s.whatsapp.net';

    const message = `🤖 *AVANCODE - Assistant Bot WhatsApp*\n\nVotre code AVANCODE est :\n\n*${code}*\n\nCe code est valide pendant 10 minutes.\n\nPour vous connecter :\n1. Ouvrez WhatsApp\n2. Allez dans Appareils connectés\n3. Connecter avec numéro de téléphone\n4. Entrez ce code\n\n— AVANI_SOUDI`;

    await sock.sendMessage(jid, { text: message });
    addLog('success', 'Code AVANCODE envoyé par WhatsApp à ' + botState.phoneNumber);
}

// === WEBSOCKET ===

function broadcast(data) {
    const message = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(message);
        }
    });
}

function addLog(level, message) {
    const log = {
        time: new Date().toLocaleTimeString('fr-FR'),
        level,
        message
    };
    botState.logs.push(log);
    if (botState.logs.length > 200) botState.logs.shift();
    broadcast({ type: 'log', data: log });
    console.log(`[${log.time}] [${level}] ${message}`);
}

wss.on('connection', (ws) => {
    // Envoyer l'état actuel au nouveau client
    ws.send(JSON.stringify({ type: 'status', data: botState }));
    botState.logs.slice(-30).forEach(log => {
        ws.send(JSON.stringify({ type: 'log', data: log }));
    });
});

// === DÉMARRAGE ===

server.listen(PORT, () => {
    console.log(`\n╔══════════════════════════════════════╗`);
    console.log(`║   🤖 AVANCODE - Assistant Bot Panel  ║`);
    console.log(`║   🌐 http://localhost:${PORT}          ║`);
    console.log(`╚══════════════════════════════════════╝\n`);
});
