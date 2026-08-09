const MORSE = { a:'.-',b:'-...',c:'-.-.',d:'-..',e:'.',f:'..-.',g:'--.',h:'....',i:'..',j:'.---',k:'-.-',l:'.-..',m:'--',n:'-.',o:'---',p:'.--.',q:'--.-',r:'.-.',s:'...',t:'-',u:'..-',v:'...-',w:'.--',x:'-..-',y:'-.--',z:'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',' ':'/' };
const REVERSE_MORSE = Object.fromEntries(Object.entries(MORSE).map(([k,v]) => [v,k]));

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '📡 .morse <texte> — convertit en morse\n.morse decode <morse> — reconvertit en texte' });
            if (args[0] === 'decode') {
                const morseText = args.slice(1).join(' ');
                const text = morseText.split(' ').map(m => REVERSE_MORSE[m] || '').join('');
                return await sock.sendMessage(from, { text: `📡 *TEXTE*\n\n${text}` });
            }
            const text = args.join(' ').toLowerCase();
            const morse = text.split('').map(c => MORSE[c] || '').join(' ');
            await sock.sendMessage(from, { text: `📡 *MORSE*\n\n${morse}` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
