module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length < 2) return await sock.sendMessage(from, { text: '⚖️ .bmi <poids en kg> <taille en cm>\nExemple: .bmi 70 175' });
            const weight = parseFloat(args[0]);
            const heightCm = parseFloat(args[1]);
            if (isNaN(weight) || isNaN(heightCm) || heightCm <= 0) return await sock.sendMessage(from, { text: '❌ Valeurs invalides' });
            const heightM = heightCm / 100;
            const bmi = weight / (heightM * heightM);
            let category = 'Insuffisance pondérale';
            if (bmi >= 18.5 && bmi < 25) category = 'Poids normal';
            else if (bmi >= 25 && bmi < 30) category = 'Surpoids';
            else if (bmi >= 30) category = 'Obésité';
            await sock.sendMessage(from, { text: `⚖️ *IMC: ${bmi.toFixed(1)}*\n\n📋 Catégorie: ${category}\n\n_Donné à titre indicatif, ne remplace pas un avis médical_` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
