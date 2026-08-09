const fs = require('fs');
const path = require('path');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '📄 .pdf <texte>\nCrée un PDF simple à partir de ton texte' });

            let PDFDocument;
            try {
                PDFDocument = require('pdfkit');
            } catch {
                return await sock.sendMessage(from, { text: '❌ Module pdfkit non installé. Lance: npm install pdfkit' });
            }

            const text = args.join(' ');
            const tempDir = path.join(__dirname, '..', 'temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            const filePath = path.join(tempDir, `doc_${Date.now()}.pdf`);

            const doc = new PDFDocument();
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);
            doc.fontSize(14).text(text, { align: 'left' });
            doc.end();

            stream.on('finish', async () => {
                await sock.sendMessage(from, {
                    document: fs.readFileSync(filePath),
                    mimetype: 'application/pdf',
                    fileName: 'document.pdf'
                });
                fs.unlinkSync(filePath);
            });
        } catch (error) {
            console.error('Erreur pdf:', error);
            await sock.sendMessage(from, { text: '❌ Erreur lors de la création du PDF' });
        }
    }
};
