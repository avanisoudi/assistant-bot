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

// État du bot
let botState = {
    status: 'offline', // offline, connecting, online
    pairingCode: null,
    phoneNumber: null,
    logs: []
};
let sock = null;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === API ROUTES ===

// Statut du bot
app.get('/api/status', (req, res) => {
    res.json({
        status: botState.status,
        pairingCode: botState.pairingCode,
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
        addLog('info', 'Bot arrêté.');
        broadcast({ type: 'status', data: botState });
        res.json({ success: true, message: 'Bot arrêté' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === FONCTIONS BOT ===

let pairingAttempts = 0;
let pairingInterval = null;
let waitingForPairing = false;

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['AVANCODE', 'Chrome', '120.0.0'],
        connectTimeoutMs: 120000
    });

    // Pairing Code - avec retry automatique pendant 10 minutes
    if (!sock.authState.creds.registered) {
        waitingForPairing = true;
        await delay(5000);
        await requestPairingWithRetry();
    }

    // Sauvegarde credentials
    sock.ev.on('creds.update', saveCreds);

    // Connexion
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            botState.status = 'online';
            botState.pairingCode = null;
            waitingForPairing = false;
            pairingAttempts = 0;
            if (pairingInterval) { clearInterval(pairingInterval); pairingInterval = null; }
            addLog('success', 'Bot connecte avec succes !');
            broadcast({ type: 'status', data: botState });
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            // Si on attend le pairing, ne pas se reconnecter en boucle
            if (waitingForPairing && pairingAttempts < 10) {
                addLog('info', 'En attente du code AVANCODE... (ne fermez pas)');
                botState.status = 'connecting';
                broadcast({ type: 'status', data: botState });
                setTimeout(() => startBot(), 15000);
            } else if (shouldReconnect && botState.status !== 'offline' && !waitingForPairing) {
                addLog('warn', 'Deconnexion, reconnexion dans 10s...');
                botState.status = 'connecting';
                broadcast({ type: 'status', data: botState });
                setTimeout(() => startBot(), 10000);
            } else {
                botState.status = 'offline';
                botState.pairingCode = null;
                waitingForPairing = false;
                if (pairingInterval) { clearInterval(pairingInterval); pairingInterval = null; }
                addLog('info', 'Bot deconnecte.');
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

async function requestPairingWithRetry() {
    pairingAttempts++;
    addLog('info', `Demande du code AVANCODE... (tentative ${pairingAttempts}/10)`);
    try {
        const code = await sock.requestPairingCode(botState.phoneNumber);
        botState.pairingCode = code;
        const timeLeft = Math.max(1, 10 - pairingAttempts);
        addLog('success', `Code AVANCODE: ${code}`);
        addLog('info', `Vous avez ~${timeLeft} min pour entrer ce code dans WhatsApp`);
        addLog('info', 'WhatsApp > Appareils connectes > Connecter avec numero');
        broadcast({ type: 'pairing', data: { code } });
        broadcast({ type: 'status', data: botState });
    } catch (error) {
        addLog('error', 'Erreur pairing: ' + error.message);
        if (pairingAttempts < 10) {
            addLog('info', 'Nouvelle tentative dans 60 secondes...');
        }
        broadcast({ type: 'status', data: botState });
    }
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
