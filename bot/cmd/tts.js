const fs = require('fs');
const path = require('path');
const axios = require('axios');

const FRAMES = ['🔄', '🔊', '🎙️', '🔈', '🔉', '🔊', '📢'];
const FINISH_EMOJIS = ['✅', '🎉', '✨', '🎵', '📻'];

module.exports = {
    execute: async (sock, msg, from, args) => {
        let animationMsg;
        let frameIndex = 0;
        let animationInterval;
        
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🔊 .tts <texte>\nExemple: .tts Bonjour tout le monde' });

            const text = args.join(' ');
            
            // Message initial avec animation
            const sent = await sock.sendMessage(from, { text: '🔄 *Génération audio en cours...*' });
            animationMsg = sent.key;
            
            // Animation qui modifie le même message
            animationInterval = setInterval(async () => {
                frameIndex = (frameIndex + 1) % FRAMES.length;
                try {
                    await sock.sendMessage(from, {
                        text: `${FRAMES[frameIndex]} *Génération audio en cours...*`,
                        edit: animationMsg
                    });
                } catch (e) {}
            }, 500);

            const tempDir = path.join(__dirname, '..', 'temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            const filePath = path.join(tempDir, `tts-${Date.now()}.mp3`);

            // API Google TTS (gratuit, sans clé)
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=fr&client=tw-ob`;
            
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 15000
            });

            fs.writeFileSync(filePath, response.data);

            // Arrêter l'animation
            clearInterval(animationInterval);
            
            // Message de succès
            const finishEmoji = FINISH_EMOJIS[Math.floor(Math.random() * FINISH_EMOJIS.length)];
            await sock.sendMessage(from, {
                text: `${finishEmoji} *Audio généré avec succès !*`,
                edit: animationMsg
            });

            await sock.sendMessage(from, {
                audio: fs.readFileSync(filePath),
                mimetype: 'audio/mpeg',
                ptt: false
            });

            fs.unlinkSync(filePath);
            
        } catch (error) {
            console.error('Erreur tts:', error.message);
            if (animationInterval) clearInterval(animationInterval);
            if (animationMsg) {
                try {
                    await sock.sendMessage(from, {
                        text: '❌ *Erreur lors de la génération audio*',
                        edit: animationMsg
                    });
                } catch (e) {}
            }
            await sock.sendMessage(from, { text: '❌ Erreur lors de la génération audio (service temporairement indisponible)' });
        }
    }
};