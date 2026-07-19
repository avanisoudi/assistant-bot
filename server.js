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
// Durée de validité du pairing code : 3 minutes (180 000 ms)
const PAIRING_CODE_TTL = 3 * 60 * 1000; // 3 minutes

// État du bot
let botState = {
    status: 'offline', // offline, connecting, online
    pairingCode: null,
    pairingCodeExpiry: null,
    phoneNumber: null,
    logs: []
};
let sock = null;
let pairingCodeAttempted = false;
let pendingCodeToSend = null;
let codeSent = false;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === API ROUTES ===

app.get('/api/status', (req, res) => {
    res.json({
        status: botState.status,
        pairingCode: botState.pairingCode,
        pairingCodeExpiry: botState.pairingCodeExpiry,
        phoneNumber: botState.phoneNumber,
        logs: botState.logs.slice(-50)
    });
});

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
    pairingCodeAttempted = false;
    codeSent = false;
    pendingCodeToSend = null;
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

    // Pairing Code — demandé UNE SEULE FOIS par session
    if (!sock.authState.creds.registered && !pairingCodeAttempted) {
        pairingCodeAttempted = true;
        await delay(3000);
        addLog('info', 'Demande du code AVANCODE...');
        try {
            const code = await sock.requestPairingCode(botState.phoneNumber);
            botState.pairingCode = code;
            botState.pairingCodeExpiry = Date.now() + PAIRING_CODE_TTL;
            pendingCodeToSend = code;
            addLog('success', 'Code AVANCODE: ' + code + ' (valide 3 min)');
            broadcast({ type: 'pairing', data: { code, expiry: botState.pairingCodeExpiry } });
            broadcast({ type: 'status', data: botState });
        } catch (error) {
            addLog('error', 'Erreur pairing: ' + error.message);
            broadcast({ type: 'status', data: botState });
        }
    }

    // Gestion de la connexion
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            botState.status = 'online';
            botState.pairingCode = null;
            botState.pairingCodeExpiry = null;
            addLog('success', 'Bot connecté avec succès !');
            broadcast({ type: 'status', data: botState });

            // Envoyer le code AVANCODE par WhatsApp après connexion ouverte
            if (pendingCodeToSend && !codeSent) {
                codeSent = true;
                sendPairingCodeWhatsApp(pendingCodeToSend).then(() => {
                    pendingCodeToSend = null;
                }).catch(err => {
                    addLog('warn', 'Erreur envoi WhatsApp: ' + err.message);
                    addLog('info', 'Le code est affiché dans le panneau web.');
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
}

// === ENVOI DU CODE AVANCODE PAR WHATSAPP ===

async function sendPairingCodeWhatsApp(code) {
    await delay(5000);

    const jid = botState.phoneNumber + '@s.whatsapp.net';

    const message = `🤖 *AVANCODE - Assistant Bot WhatsApp*\n\nVotre code AVANCODE est :\n\n*${code}*\n\nCe code est valide pendant 3 minutes.\n\nPour vous connecter :\n1. Ouvrez WhatsApp\n2. Allez dans Appareils connectés\n3. Connecter avec numéro de téléphone\n4. Entrez ce code\n\n— AVANI_SOUDI`;

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
