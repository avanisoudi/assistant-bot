const express = require('express');
const http = require('http');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs-extra');
const { spawn } = require('child_process');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = Number(process.env.PORT || 3000);
const BOT_DIR = path.resolve(process.env.BOT_DIR || path.join(__dirname, 'bot'));
const AUTH_DIR = path.resolve(process.env.BOT_AUTH_DIR || path.join(BOT_DIR, 'auth_info'));
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const COOKIE_NAME = 'assistant_bot_admin';
let botProcess = null;
let botState = { status: 'offline', connection: 'offline', pairingCode: null, pairingIssuedAt: null, startedAt: null, logs: [] };

function broadcast(data) { const payload = JSON.stringify(data); for (const client of wss.clients) if (client.readyState === 1) client.send(payload); }
function addLog(level, message) { const log = { time: new Date().toISOString(), level, message: String(message).slice(0, 1000) }; botState.logs.push(log); if (botState.logs.length > 500) botState.logs.shift(); broadcast({ type: 'log', data: log }); }
function publicState() { return { ...botState, logs: botState.logs.slice(-100), uptime: botState.startedAt ? Math.floor((Date.now() - botState.startedAt) / 1000) : 0, memory: process.memoryUsage().rss }; }
function safeRelative(input = '') { const value = String(input).replace(/\\/g, '/').replace(/^\/+/, ''); const target = path.resolve(BOT_DIR, value); if (target !== BOT_DIR && !target.startsWith(BOT_DIR + path.sep)) throw new Error('Chemin refusé'); return target; }
function sign(value) { return crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('hex'); }
function isAuthenticated(req) { const raw = req.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith(COOKIE_NAME + '='))?.split('=')[1]; if (!raw) return false; const [value, signature] = decodeURIComponent(raw).split('.'); if (!value || !signature) return false; const expected = sign(value); return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) && value === 'admin'; }
function requireAuth(req, res, next) { if (!isAuthenticated(req)) return res.status(401).json({ error: 'Authentification requise' }); next(); }
function attachBotListeners(child) { const consume = (chunk, level) => { for (const line of chunk.toString().split(/\r?\n/).filter(Boolean)) { const pairing = line.match(/PAIRING_CODE:([A-Z0-9-]+)/i); if (pairing) { botState.pairingCode = pairing[1]; botState.pairingIssuedAt = Date.now(); botState.connection = 'pairing_required'; broadcast({ type: 'pairing', data: { code: pairing[1], issuedAt: botState.pairingIssuedAt } }); } if (/Bot connecté|Bot connecte|🚀 Bot/i.test(line)) { botState.connection = 'connected'; botState.pairingCode = null; broadcast({ type: 'connection', data: { status: 'connected' } }); } addLog(level, line); } }; child.stdout.on('data', data => consume(data, 'info')); child.stderr.on('data', data => consume(data, 'error')); child.on('error', error => { addLog('error', error.message); botProcess = null; botState.status = 'offline'; }); child.on('close', code => { if (botProcess === child) botProcess = null; botState.status = 'offline'; botState.connection = code === 0 ? 'offline' : 'error'; botState.startedAt = null; addLog(code === 0 ? 'warn' : 'error', `Processus bot arrêté (code ${code})`); broadcast({ type: 'status', data: publicState() }); }); }
function startBot() { if (botProcess) return false; const entry = path.join(BOT_DIR, 'index.js'); if (!fs.existsSync(entry)) throw new Error('bot/index.js introuvable'); fs.ensureDirSync(AUTH_DIR); botState.pairingCode = null; botState.connection = 'starting'; botProcess = spawn(process.execPath, [entry], { cwd: BOT_DIR, env: { ...process.env, BOT_AUTH_DIR: AUTH_DIR, NODE_ENV: 'production' }, stdio: ['ignore', 'pipe', 'pipe'] }); botState.status = 'online'; botState.startedAt = Date.now(); addLog('success', 'Processus Assistant Bot Pairing démarré.'); attachBotListeners(botProcess); broadcast({ type: 'status', data: publicState() }); return true; }
function stopBot() { if (!botProcess) return false; botProcess.kill('SIGTERM'); botProcess = null; botState.status = 'offline'; botState.connection = 'offline'; botState.startedAt = null; botState.pairingCode = null; addLog('info', 'Processus arrêté par l’administrateur.'); broadcast({ type: 'status', data: publicState() }); return true; }

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.post('/api/login', (req, res) => { if (!ADMIN_PASSWORD || typeof req.body.password !== 'string' || req.body.password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Mot de passe administrateur invalide' }); const token = encodeURIComponent('admin.' + sign('admin')); res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Secure`); res.json({ success: true }); });
app.post('/api/logout', (req, res) => { res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Max-Age=0; HttpOnly; SameSite=Strict; Path=/; Secure`); res.json({ success: true }); });
app.get('/api/me', (req, res) => res.json({ authenticated: isAuthenticated(req) }));
app.get('/api/status', requireAuth, (req, res) => res.json(publicState()));
app.post('/api/start', requireAuth, (req, res) => { try { res.json({ success: startBot(), state: publicState() }); } catch (e) { res.status(500).json({ error: e.message }); } });
app.post('/api/stop', requireAuth, (req, res) => res.json({ success: stopBot(), state: publicState() }));
app.post('/api/restart', requireAuth, (req, res) => { stopBot(); setTimeout(() => { try { startBot(); } catch (e) { addLog('error', e.message); } }, 800); res.json({ success: true }); });
app.post('/api/pairing/reset', requireAuth, (req, res) => { stopBot(); fs.removeSync(AUTH_DIR); addLog('warn', 'Session WhatsApp supprimée. Un nouveau pairing code sera généré au prochain démarrage.'); res.json({ success: true }); });
app.get('/api/pairing', requireAuth, (req, res) => res.json({ code: botState.pairingCode, issuedAt: botState.pairingIssuedAt, connection: botState.connection }));
app.get('/api/files', requireAuth, (req, res) => { try { const dir = safeRelative(req.query.path || ''); const files = fs.readdirSync(dir).map(name => { const full = path.join(dir, name); const stat = fs.statSync(full); return { name, type: stat.isDirectory() ? 'folder' : 'file', size: stat.size, modified: stat.mtime }; }).sort((a,b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name)); res.json({ currentPath: req.query.path || '', files }); } catch (e) { res.status(400).json({ error: e.message }); } });
app.get('/api/file', requireAuth, (req, res) => { try { const full = safeRelative(req.query.path || ''); if (fs.statSync(full).isDirectory()) throw new Error('Dossier non éditable'); res.json({ path: req.query.path, content: fs.readFileSync(full, 'utf8') }); } catch (e) { res.status(404).json({ error: e.message }); } });
app.post('/api/file', requireAuth, (req, res) => { try { if (typeof req.body.path !== 'string' || typeof req.body.content !== 'string') throw new Error('Données invalides'); const full = safeRelative(req.body.path); fs.ensureDirSync(path.dirname(full)); fs.writeFileSync(full, req.body.content, 'utf8'); addLog('info', `Fichier modifié: ${req.body.path}`); res.json({ success: true }); } catch (e) { res.status(400).json({ error: e.message }); } });
app.post('/api/folder', requireAuth, (req, res) => { try { fs.ensureDirSync(safeRelative(req.body.path)); res.json({ success: true }); } catch (e) { res.status(400).json({ error: e.message }); } });
app.delete('/api/file', requireAuth, (req, res) => { try { fs.removeSync(safeRelative(req.query.path)); res.json({ success: true }); } catch (e) { res.status(400).json({ error: e.message }); } });
wss.on('connection', ws => { ws.send(JSON.stringify({ type: 'status', data: publicState() })); botState.logs.slice(-50).forEach(log => ws.send(JSON.stringify({ type: 'log', data: log }))); });
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
server.listen(PORT, '0.0.0.0', () => addLog('success', `Assistant Bot Pairing prêt sur le port ${PORT}.`));
process.on('SIGTERM', () => { stopBot(); server.close(() => process.exit(0)); });
