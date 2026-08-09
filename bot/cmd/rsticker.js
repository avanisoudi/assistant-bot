const fs = require('fs');
const path = require('path');

const stickersDir = path.join(__dirname, '..', 'db', 'stickers');
const stickersIndex = path.join(stickersDir, 'index.json');

function loadIndex() {
    if (!fs.existsSync(stickersIndex)) return {};
    try {
        return JSON.parse(fs.readFileSync(stickersIndex, 'utf-8'));
    } catch (e) {
        return {};
    }
}

module.exports = {
    execute: async (sock, msg, from, args) => {
        // Seul le propriétaire peut utiliser cette commande
        if (!msg.key.fromMe) {
            return sock.sendMessage(from, { 
                text: "❌ Seul le propriétaire peut récupérer les stickers !" 
            });
        }

        const subcommand = args[0]?.toLowerCase();
        const index = loadIndex();
        const packs = Object.entries(index);

        // 📋 LISTE DES PACKS
        if (!subcommand || subcommand === 'list') {
            if (packs.length === 0) {
                return sock.sendMessage(from, { 
                    text: "📦 Aucun sticker enregistré pour le moment.\n\n💡 Les stickers seront automatiquement sauvegardés quand ils seront envoyés dans les groupes/discussions." 
                });
            }

            let text = `╭───「 📦 *PACKS DE STICKERS* 」\n`;
            text += `│\n`;
            
            let totalStickers = 0;
            packs.forEach(([jid, data], i) => {
                const count = data.stickers.length;
                totalStickers += count;
                const type = data.type === 'group' ? '👥' : '💬';
                text += `│ ${i + 1}. ${type} *${data.name}*\n`;
                text += `│    📊 ${count} stickers\n`;
                text += `│    🆔 \`${jid}\`\n`;
            });
            
            text += `│\n`;
            text += `│ 📊 *Total : ${totalStickers} stickers dans ${packs.length} packs*\n`;
            text += `│\n`;
            text += `│ *Commandes :*\n`;
            text += `│ • \`.rsticker list\` - Cette liste\n`;
            text += `│ • \`.rsticker all\` - Envoie TOUS les stickers\n`;
            text += `│ • \`.rsticker <numéro>\` - Envoie un pack spécifique\n`;
            text += `│ • \`.rsticker clear\` - Supprime tous les stickers\n`;
            text += `╰──────────────────`;

            return sock.sendMessage(from, { text });
        }

        // 🗑️ SUPPRIMER TOUS LES STICKERS
        if (subcommand === 'clear') {
            try {
                // Supprime tous les fichiers
                const entries = fs.readdirSync(stickersDir);
                for (const entry of entries) {
                    const entryPath = path.join(stickersDir, entry);
                    if (entry === 'index.json') continue;
                    if (fs.statSync(entryPath).isDirectory()) {
                        fs.rmSync(entryPath, { recursive: true, force: true });
                    }
                }
                fs.writeFileSync(stickersIndex, JSON.stringify({}));
                return sock.sendMessage(from, { text: "🗑️ Tous les stickers ont été supprimés !" });
            } catch (error) {
                console.error("Erreur clear:", error);
                return sock.sendMessage(from, { text: "❌ Erreur lors de la suppression." });
            }
        }

        // 📤 ENVOYER TOUS LES STICKERS
        if (subcommand === 'all') {
            if (packs.length === 0) {
                return sock.sendMessage(from, { text: "📦 Aucun sticker à envoyer." });
            }

            await sock.sendMessage(from, { 
                text: `📦 Envoi de tous les stickers en privé... (${packs.reduce((sum, [_, d]) => sum + d.stickers.length, 0)} stickers)` 
            });

            let sent = 0;
            let failed = 0;

            for (const [jid, data] of packs) {
                // Envoie un séparateur entre les packs
                await sock.sendMessage(msg.key.remoteJid, { 
                    text: `📦 *PACK : ${data.name}* (${data.stickers.length} stickers)` 
                });
                await new Promise(r => setTimeout(r, 500));

                for (const sticker of data.stickers) {
                    try {
                        if (!fs.existsSync(sticker.filepath)) continue;
                        
                        await sock.sendMessage(msg.key.remoteJid, {
                            sticker: fs.readFileSync(sticker.filepath)
                        });
                        sent++;
                        await new Promise(r => setTimeout(r, 300)); // Délai anti-rate-limit
                    } catch (error) {
                        console.error("Erreur envoi sticker:", error);
                        failed++;
                    }
                }
            }

            return sock.sendMessage(from, { 
                text: `✅ Envoi terminé !\n📤 Envoyés : *${sent}*\n❌ Échoués : *${failed}*` 
            });
        }

        // 📤 ENVOYER UN PACK SPÉCIFIQUE
        const packNumber = parseInt(subcommand);
        if (!isNaN(packNumber) && packNumber > 0 && packNumber <= packs.length) {
            const [jid, data] = packs[packNumber - 1];

            await sock.sendMessage(from, { 
                text: `📦 Envoi du pack *${data.name}* en privé... (${data.stickers.length} stickers)` 
            });

            let sent = 0;
            let failed = 0;

            for (const sticker of data.stickers) {
                try {
                    if (!fs.existsSync(sticker.filepath)) continue;
                    
                    await sock.sendMessage(msg.key.remoteJid, {
                        sticker: fs.readFileSync(sticker.filepath)
                    });
                    sent++;
                    await new Promise(r => setTimeout(r, 300));
                } catch (error) {
                    console.error("Erreur envoi sticker:", error);
                    failed++;
                }
            }

            return sock.sendMessage(from, { 
                text: `✅ Pack *${data.name}* envoyé !\n📤 Envoyés : *${sent}*\n❌ Échoués : *${failed}*` 
            });
        }

        return sock.sendMessage(from, { 
            text: "❌ Commande invalide.\n\nUsage :\n• `.rsticker list` - Liste des packs\n• `.rsticker all` - Tous les stickers\n• `.rsticker <numéro>` - Un pack spécifique\n• `.rsticker clear` - Tout supprimer" 
        });
    }
};
