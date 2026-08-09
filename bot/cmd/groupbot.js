module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const text = `╔══════════════════════╗

   _*GROUPE VPN FREE SURF⚡*_ https://chat.whatsapp.com/L3eLoEoEpym9uB1aMlIeAB?s=cl&p=a&mlu=0
╚══════════════════════╝

> 🚀 *AssistantBot V1.1.9*`;

            await sock.sendMessage(from, { text });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
