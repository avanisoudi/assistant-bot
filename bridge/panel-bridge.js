'use strict';
/**
 * Pont panneau ↔ bot — Assistant Bot
 * ----------------------------------
 * Ce fichier vit à côté de `bot/index.js`. Il fait deux choses, et rien d'autre :
 *
 *  1. il publie les groupes WhatsApp RÉELS dans `bot/data/groups.json` (le panneau les lit) ;
 *  2. il exécute les commandes déposées par le panneau dans `bot/data/panel-commands/`
 *     (créer un groupe, renommer, changer la description, inviter, ajouter/retirer, quitter).
 *
 * Aucune donnée n'est inventée : si WhatsApp ne répond pas, le fichier garde les derniers
 * groupes connus et porte un champ `error` que le panneau affiche tel quel.
 *
 * Installation (une seule ligne à ajouter dans `bot/index.js`, à l'ouverture de la
 * connexion) :
 *
 *     require('./panel-bridge').attachPanelBridge(sock)
 *
 * Exemple, dans le handler `connection.update` de Baileys :
 *
 *     if (update.connection === 'open') require('./panel-bridge').attachPanelBridge(sock)
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(process.env.PANEL_DATA_DIR || path.join(__dirname, 'data'));
const GROUPS_FILE = path.join(DATA_DIR, 'groups.json');
const COMMANDS_DIR = path.join(DATA_DIR, 'panel-commands');
const REFRESH_FILE = path.join(DATA_DIR, 'groups-refresh.request');
const PUBLISH_MS = Number(process.env.PANEL_PUBLISH_MS || 15000);
const COMMAND_MS = Number(process.env.PANEL_COMMAND_MS || 2000);
const REFRESH_MS = Number(process.env.PANEL_REFRESH_MS || 3000);

const state = { sock: null, timers: [], started: false, publishing: false, lastRefresh: '' };

/* ------------------------------------------------------------------ outils */

function writeJsonAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, file);
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function digits(value) {
  return String(value || '').replace(/[^0-9]/g, '');
}

function toUserJid(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;
  if (raw.includes('@')) return raw;
  const number = digits(raw);
  return number ? `${number}@s.whatsapp.net` : null;
}

/**
 * Identité comparable d'un JID : on garde le numéro et on jette le suffixe d'appareil
 * et le domaine. Sinon `237…:1@s.whatsapp.net` (le bot) ne reconnaît pas
 * `237…@s.whatsapp.net` (le même compte dans la liste des participants).
 */
function bareId(value) {
  return String(value || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
}

function selfIds(sock) {
  const ids = new Set();
  for (const value of [sock && sock.user ? sock.user.id : null, sock && sock.user ? sock.user.lid : null]) {
    if (!value) continue;
    ids.add(String(value));
    if (bareId(value)) ids.add(bareId(value));
  }
  return ids;
}

function roleOf(group, sock) {
  const me = selfIds(sock);
  const participants = Array.isArray(group && group.participants) ? group.participants : [];
  const mine = participants.find(participant => {
    const id = String(participant.id || '');
    const phone = String(participant.phoneNumber || '');
    return me.has(id) || (bareId(id) && me.has(bareId(id))) || (phone && (me.has(phone) || me.has(bareId(phone))));
  });
  if (mine && mine.admin === 'superadmin') return 'owner';
  if (mine && mine.admin) return 'admin';
  return 'member';
}

async function inviteCodeFor(sock, jid, role) {
  if (role === 'member') return null; // WhatsApp réserve le code aux admins.
  try { return await sock.groupInviteCode(jid); } catch { return null; }
}

async function avatarFor(sock, jid) {
  try { return await sock.profilePictureUrl(jid, 'image'); } catch { return null; }
}

/* -------------------------------------------------------- lecture WhatsApp */

async function snapshot(sock) {
  const map = await sock.groupFetchAllParticipating();
  const groups = [];
  for (const jid of Object.keys(map || {})) {
    const group = map[jid] || {};
    const role = roleOf(group, sock);
    const participants = Array.isArray(group.participants) ? group.participants : [];
    groups.push({
      jid,
      subject: group.subject || 'Groupe sans nom',
      size: Number(group.size || participants.length || 0),
      privacy: group.announce ? 'private' : 'public',
      announce: Boolean(group.announce),
      isCommunity: Boolean(group.isCommunity),
      description: group.desc || '',
      creation: group.creation || null,
      role,
      inviteCode: await inviteCodeFor(sock, jid, role),
      avatarUrl: await avatarFor(sock, jid),
    });
  }
  groups.sort((a, b) => a.subject.localeCompare(b.subject, 'fr'));
  return groups;
}

async function publish(reason) {
  const sock = state.sock;
  if (!sock || state.publishing) return null;
  state.publishing = true;
  try {
    const groups = await snapshot(sock);
    const payload = {
      source: 'panel-bridge',
      reason: reason || 'timer',
      updatedAt: new Date().toISOString(),
      account: (sock.user && sock.user.id) || null,
      groups,
      invitations: [],
    };
    writeJsonAtomic(GROUPS_FILE, payload);
    return payload;
  } catch (error) {
    const previous = readJson(GROUPS_FILE);
    writeJsonAtomic(GROUPS_FILE, {
      source: 'panel-bridge',
      reason: reason || 'timer',
      updatedAt: new Date().toISOString(),
      account: (sock.user && sock.user.id) || null,
      error: (error && error.message) || String(error),
      groups: (previous && previous.groups) || [],
      invitations: (previous && previous.invitations) || [],
    });
    return null;
  } finally {
    state.publishing = false;
  }
}

/* ------------------------------------------------------------ commandes */

async function execute(sock, action, params) {
  const jid = params.jid || params.id || null;
  const list = value => (Array.isArray(value) ? value : [value]).map(toUserJid).filter(Boolean);

  switch (action) {
    case 'refresh': {
      const payload = await publish('panel-request');
      return { refreshed: Boolean(payload), groups: payload ? payload.groups.length : 0 };
    }
    case 'create': {
      const subject = String(params.subject || '').trim();
      if (!subject) throw new Error('Nom de groupe manquant');
      const group = await sock.groupCreate(subject, list(params.participants));
      const created = group ? (group.gid || group.id || null) : null;
      if (created && params.description) {
        try { await sock.groupUpdateDescription(created, String(params.description)); } catch { /* la description n'est pas bloquante */ }
      }
      await publish('create');
      return { jid: created, subject };
    }
    case 'rename': {
      if (!jid) throw new Error('Groupe manquant');
      await sock.groupUpdateSubject(jid, String(params.subject || '').trim());
      await publish('rename');
      return { jid, subject: params.subject };
    }
    case 'describe': {
      if (!jid) throw new Error('Groupe manquant');
      await sock.groupUpdateDescription(jid, String(params.description || ''));
      await publish('describe');
      return { jid };
    }
    case 'invite': {
      if (!jid) throw new Error('Groupe manquant');
      const code = await sock.groupInviteCode(jid);
      return { jid, inviteCode: code, inviteUrl: `https://chat.whatsapp.com/${code}` };
    }
    case 'leave': {
      if (!jid) throw new Error('Groupe manquant');
      await sock.groupLeave(jid);
      await publish('leave');
      return { jid };
    }
    case 'add':
    case 'remove':
    case 'promote':
    case 'demote': {
      if (!jid) throw new Error('Groupe manquant');
      const participants = list(params.participants || params.participant);
      if (!participants.length) throw new Error('Aucun numéro valide');
      const result = await sock.groupParticipantsUpdate(jid, participants, action);
      await publish(action);
      return { jid, participants, result };
    }
    default:
      throw new Error(`Action inconnue : ${action}`);
  }
}

async function drainCommands() {
  const sock = state.sock;
  if (!sock) return;
  let entries = [];
  try { entries = fs.readdirSync(COMMANDS_DIR).filter(name => name.endsWith('.json') && !name.endsWith('.result.json')); } catch { return; }
  for (const name of entries) {
    const file = path.join(COMMANDS_DIR, name);
    const request = readJson(file);
    if (!request || !request.id) { try { fs.rmSync(file, { force: true }); } catch { /* ignore */ } continue; }
    const resultFile = path.join(COMMANDS_DIR, `${request.id}.result.json`);
    if (fs.existsSync(resultFile)) { try { fs.rmSync(file, { force: true }); } catch { /* ignore */ } continue; }
    try {
      const data = await execute(sock, request.action, request.params || {});
      writeJsonAtomic(resultFile, { id: request.id, action: request.action, status: 'done', finishedAt: new Date().toISOString(), data });
    } catch (error) {
      writeJsonAtomic(resultFile, { id: request.id, action: request.action, status: 'error', finishedAt: new Date().toISOString(), error: (error && error.message) || String(error) });
    }
    try { fs.rmSync(file, { force: true }); } catch { /* ignore */ }
  }
}

/* ----------------------------------------------------------------- API */

function attachPanelBridge(sock) {
  state.sock = sock;
  if (state.started) {
    void publish('reconnect');
    return state;
  }
  state.started = true;
  fs.mkdirSync(COMMANDS_DIR, { recursive: true });
  void publish('startup');

  state.timers.push(setInterval(() => { void publish('timer'); }, PUBLISH_MS));
  state.timers.push(setInterval(() => { void drainCommands(); }, COMMAND_MS));
  state.timers.push(setInterval(() => {
    let stamp = '';
    try { stamp = fs.existsSync(REFRESH_FILE) ? fs.readFileSync(REFRESH_FILE, 'utf8').trim() : ''; } catch { stamp = ''; }
    if (stamp && stamp !== state.lastRefresh) {
      state.lastRefresh = stamp;
      void publish('panel-request');
    }
  }, REFRESH_MS));

  for (const timer of state.timers) if (timer && timer.unref) timer.unref();

  if (process.env.PANEL_BRIDGE_LOG !== '0') {
    console.log(`[panel-bridge] groupes publiés dans ${GROUPS_FILE} · rafraîchissement ${Math.round(PUBLISH_MS / 1000)}s · commandes ${Math.round(COMMAND_MS / 1000)}s`);
  }
  return state;
}

function detachPanelBridge() {
  for (const timer of state.timers) clearInterval(timer);
  state.timers = [];
  state.started = false;
  state.sock = null;
}

module.exports = { attachPanelBridge, detachPanelBridge, publishGroups: publish, dataDir: DATA_DIR };
