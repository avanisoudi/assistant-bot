const SHAYARIS = [
    "दिल से निकली है ये बात,\nतेरे बिना अधूरी हर मुलाकात। 💫",
    "ज़िंदगी एक सफर है सुहाना,\nयहाँ कल क्या हो किसने जाना। 🌸",
    "मोहब्बत करना गुनाह नहीं,\nबस इज़हार करने की देर है। ❤️",
    "खुशियाँ बाँटो, ग़म भुलाओ,\nज़िंदगी को खूबसूरत बनाओ। 🌟"
];

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const shayari = SHAYARIS[Math.floor(Math.random() * SHAYARIS.length)];
            await sock.sendMessage(from, { text: `📜 *SHAYARI*\n\n${shayari}` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
