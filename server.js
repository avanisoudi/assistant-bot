const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs-extra');
const { spawn } = require('child_process');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const BOT_DIR = path.join(__dirname, 'bot');

// État du bot
let botState = {
    status: 'offline',
    logs: [],
    uptime: null,
    startedAt: null
};
let botProcess = null;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// === API: STATUT ===
app.get('/api/status', (req, res) => {
    res.json({
        status: botState.status,
        logs: botState.logs.slice(-100),
        uptime: botState.startedAt ? Math.floor((Date.now() - botState.startedAt) / 1000) : 0,
        memory: process.memoryUsage()
    });
});

// === API: DÉMARRER LE BOT ===
app.post('/api/start', (req, res) => {
    if (botProcess) {
        return res.status(400).json({ error: 'Le bot est deja en cours' });
    }

    const indexPath = path.join(BOT_DIR, 'index.js');
    if (!fs.existsSync(indexPath)) {
        return res.status(400).json({ error: 'Fichier index.js introuvable dans /bot' });
    }

    try {
        botProcess = spawn('node', ['index.js'], {
            cwd: BOT_DIR,
            env: { ...process.env, NODE_ENV: 'production' }
        });

        botState.status = 'online';
        botState.startedAt = Date.now();
        addLog('success', 'Bot demarre avec succes !');
        broadcast({ type: 'status', data: { status: 'online' } });

        botProcess.stdout.on('data', (data) => {
            const lines = data.toString().split('\n').filter(l => l.trim());
            lines.forEach(line => addLog('info', line));
        });

        botProcess.stderr.on('data', (data) => {
            const lines = data.toString().split('\n').filter(l => l.trim());
            lines.forEach(line => addLog('error', line));
        });

        botProcess.on('close', (code) => {
            botProcess = null;
            botState.status = 'offline';
            botState.startedAt = null;
            addLog('warn', `Bot arrete (code: ${code})`);
            broadcast({ type: 'status', data: { status: 'offline' } });
        });

        res.json({ success: true, message: 'Bot demarre' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === API: ARRÊTER LE BOT ===
app.post('/api/stop', (req, res) => {
    if (!botProcess) {
        return res.status(400).json({ error: 'Le bot n\'est pas en cours' });
    }
    botProcess.kill('SIGTERM');
    botProcess = null;
    botState.status = 'offline';
    botState.startedAt = null;
    addLog('info', 'Bot arrete par l\'utilisateur.');
    broadcast({ type: 'status', data: { status: 'offline' } });
    res.json({ success: true, message: 'Bot arrete' });
});

// === API: REDÉMARRER LE BOT ===
app.post('/api/restart', async (req, res) => {
    if (botProcess) {
        botProcess.kill('SIGTERM');
        botProcess = null;
        await new Promise(r => setTimeout(r, 2000));
    }
    addLog('info', 'Redemarrage du bot...');
    // Simuler un POST vers /api/start
    const indexPath = path.join(BOT_DIR, 'index.js');
    if (!fs.existsSync(indexPath)) {
        return res.status(400).json({ error: 'Fichier index.js introuvable' });
    }
    botProcess = spawn('node', ['index.js'], {
        cwd: BOT_DIR,
        env: { ...process.env, NODE_ENV: 'production' }
    });
    botState.status = 'online';
    botState.startedAt = Date.now();
    addLog('success', 'Bot redemarre !');
    broadcast({ type: 'status', data: { status: 'online' } });

    botProcess.stdout.on('data', (data) => {
        data.toString().split('\n').filter(l => l.trim()).forEach(line => addLog('info', line));
    });
    botProcess.stderr.on('data', (data) => {
        data.toString().split('\n').filter(l => l.trim()).forEach(line => addLog('error', line));
    });
    botProcess.on('close', (code) => {
        botProcess = null;
        botState.status = 'offline';
        botState.startedAt = null;
        addLog('warn', `Bot arrete (code: ${code})`);
        broadcast({ type: 'status', data: { status: 'offline' } });
    });

    res.json({ success: true, message: 'Bot redemarre' });
});

// === API: LISTE DES FICHIERS ===
app.get('/api/files', (req, res) => {
    const dir = req.query.path || '';
    const fullPath = path.join(BOT_DIR, dir);

    if (!fs.existsSync(fullPath)) {
        return res.json({ files: [] });
    }

    try {
        const items = fs.readdirSync(fullPath).map(name => {
            const itemPath = path.join(fullPath, name);
            const stat = fs.statSync(itemPath);
            return {
                name,
                type: stat.isDirectory() ? 'folder' : 'file',
                size: stat.size,
                modified: stat.mtime
            };
        });
        // Trier: dossiers d'abord, puis fichiers
        items.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'folder' ? -1 : 1;
        });
        res.json({ files: items, currentPath: dir });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === API: LIRE UN FICHIER ===
app.get('/api/file', (req, res) => {
    const filePath = req.query.path || '';
    const fullPath = path.join(BOT_DIR, filePath);

    if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
        return res.status(404).json({ error: 'Fichier introuvable' });
    }

    try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        res.json({ content, path: filePath });
    } catch (error) {
        res.status(500).json({ error: 'Impossible de lire ce fichier' });
    }
});

// === API: SAUVEGARDER UN FICHIER ===
app.post('/api/file', (req, res) => {
    const { path: filePath, content } = req.body;
    const fullPath = path.join(BOT_DIR, filePath);

    try {
        fs.ensureDirSync(path.dirname(fullPath));
        fs.writeFileSync(fullPath, content, 'utf-8');
        res.json({ success: true, message: 'Fichier sauvegarde' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === API: SUPPRIMER UN FICHIER ===
app.delete('/api/file', (req, res) => {
    const filePath = req.query.path || '';
    const fullPath = path.join(BOT_DIR, filePath);

    if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ error: 'Fichier introuvable' });
    }

    try {
        fs.removeSync(fullPath);
        res.json({ success: true, message: 'Supprime' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === API: CRÉER UN DOSSIER ===
app.post('/api/folder', (req, res) => {
    const { path: folderPath } = req.body;
    const fullPath = path.join(BOT_DIR, folderPath);

    try {
        fs.ensureDirSync(fullPath);
        res.json({ success: true, message: 'Dossier cree' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === API: CONSOLE (exécuter une commande) ===
app.post('/api/console', (req, res) => {
    const { command } = req.body;
    if (!command) return res.status(400).json({ error: 'Commande vide' });

    const child = spawn('sh', ['-c', command], { cwd: BOT_DIR, timeout: 30000 });
    let output = '';

    child.stdout.on('data', (data) => { output += data.toString(); });
    child.stderr.on('data', (data) => { output += data.toString(); });
    child.on('close', (code) => {
        addLog('info', `$ ${command}`);
        if (output.trim()) addLog('info', output.trim().substring(0, 500));
        res.json({ output, code });
    });
});

// === KEEP ALIVE (empêche Render de dormir) ===
setInterval(() => {
    const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    require('http').get(url + '/api/status');
}, 14 * 60 * 1000); // Ping toutes les 14 minutes

// === WEBSOCKET ===
function broadcast(data) {
    const message = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === 1) client.send(message);
    });
}

function addLog(level, message) {
    const log = {
        time: new Date().toLocaleTimeString('fr-FR'),
        level,
        message: message.substring(0, 500)
    };
    botState.logs.push(log);
    if (botState.logs.length > 500) botState.logs.shift();
    broadcast({ type: 'log', data: log });
}

wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'status', data: { status: botState.status } }));
    botState.logs.slice(-50).forEach(log => {
        ws.send(JSON.stringify({ type: 'log', data: log }));
    });
});

// === DÉMARRAGE ===
server.listen(PORT, () => {
    console.log(`AVANCODE Panel - http://localhost:${PORT}`);
    addLog('success', 'Panneau de controle demarre.');
    addLog('info', 'Pret a deployer votre bot.');
});
