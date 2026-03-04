import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log("=== VoteChain Email Tester ===");
console.log(`SMTP Host: ${process.env.SMTP_HOST}`);
console.log(`SMTP User: ${process.env.SMTP_USER}`);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const testMail = {
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_USER, // Send to self
    subject: "VoteChain Test Email",
    text: "Ceci est un test de configuration SMTP pour VoteChain.",
};

transporter.sendMail(testMail, (err, info) => {
    if (err) {
        console.error("❌ Échec de l'envoi:", err.message);
        console.log("\nConseils:");
        console.log("1. Vérifiez vos identifiants dans le fichier .env");
        console.log("2. Si vous utilisez Gmail, vérifiez que vous avez généré un 'Mot de passe d'application'.");
        console.log("3. Vérifiez que le port 587 (TLS) ou 465 (SSL) est ouvert.");
    } else {
        console.log("✅ Email envoyé avec succès !");
        console.log("Message ID:", info.messageId);
        console.log(`Vérifiez la boîte de réception de: ${process.env.SMTP_USER}`);
    }
});
