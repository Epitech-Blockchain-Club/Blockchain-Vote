import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error("SMTP Connection Error:", error);
    } else {
        console.log("SMTP Server is ready to take our messages");
    }
});

/**
 * Send invitation email to moderator
 */
export const sendModeratorInvitation = async (email, electionTitle, sessionTitle, portalLink) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"VoteChain" <noreply@votechain.com>',
            to: email,
            subject: `[Moderation] Invitation pour le scrutin: ${electionTitle}`,
            text: `Bonjour,\n\nVous avez été désigné comme modérateur pour la session "${sessionTitle}" du scrutin "${electionTitle}".\n\nVeuillez valider les paramètres via ce lien: ${portalLink}\n\nCordialement,\nL'équipe VoteChain`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
                    <h2 style="color: #0f172a;">Invitation Modérateur</h2>
                    <p>Bonjour,</p>
                    <p>Vous avez été désigné comme modérateur pour la session <strong>"${sessionTitle}"</strong> du scrutin <strong>"${electionTitle}"</strong>.</p>
                    <p>Votre rôle est crucial pour garantir l'intégrité du vote. Veuillez examiner et valider les paramètres via le bouton ci-dessous :</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${portalLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Accéder au Journal de Validation</a>
                    </div>
                    <p style="color: #64748b; font-size: 0.875rem;">Si le bouton ne fonctionne pas, copiez ce lien: ${portalLink}</p>
                    <hr style="margin: 30px 0; border: 0; border-top: 1px solid #e2e8f0;" />
                    <p style="font-size: 0.75rem; color: #94a3b8;">Ceci est un message automatique, merci de ne pas y répondre.</p>
                </div>
            `,
        });
        console.log("Moderator invitation sent to", email, "MessageId:", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

/**
 * Notify admin of moderator decision
 */
export const notifyAdminOfDecision = async (adminEmail, result, moderatorEmail, sessionTitle) => {
    try {
        const isApproved = result === 'validate';
        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"VoteChain" <noreply@votechain.com>',
            to: adminEmail,
            subject: `[Alerte Admin] Décision modérateur pour "${sessionTitle}"`,
            text: `Le modérateur ${moderatorEmail} a ${isApproved ? 'validé' : 'invalidé'} la session "${sessionTitle}".`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
                    <h3 style="color: ${isApproved ? '#059669' : '#dc2626'}">
                        Décision: ${isApproved ? 'VALIDÉE' : 'INVALIDÉE'}
                    </h3>
                    <p>Le modérateur <strong>${moderatorEmail}</strong> a rendu son verdict pour la session <strong>"${sessionTitle}"</strong>.</p>
                    <p>Le consensus de l'élection est mis à jour en conséquence.</p>
                </div>
            `
        });
        return true;
    } catch (error) {
        console.error("Error notifying admin:", error);
        return false;
    }
};

/**
 * Send temporary credentials to a new Admin or SuperAdmin
 */
export const sendCredentials = async (email, name, password, role) => {
    try {
        const isSuper = role === 'superadmin';
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"VoteChain" <noreply@votechain.com>',
            to: email,
            subject: `[VoteChain] Vos identifiants ${isSuper ? 'Propriétaire' : 'Administrateur'}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
                    <h2 style="color: #0f172a;">Bienvenue sur VoteChain</h2>
                    <p>Bonjour ${name},</p>
                    <p>Un compte <strong>${isSuper ? 'Super Admin' : 'Administrateur'}</strong> a été créé pour vous sur la plateforme de vote blockchain.</p>
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <p style="margin: 0; color: #64748b; font-size: 0.875rem;">Email:</p>
                        <p style="margin: 5px 0 15px 0; font-weight: bold; font-family: monospace;">${email}</p>
                        <p style="margin: 0; color: #64748b; font-size: 0.875rem;">Mot de passe temporaire:</p>
                        <p style="margin: 5px 0 0 0; font-weight: bold; font-family: monospace; font-size: 1.25rem; color: #2563eb;">${password}</p>
                    </div>
                    <p>Veuillez vous connecter pour changer votre mot de passe dès votre première visite.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5173/login" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Se connecter à la plateforme</a>
                    </div>
                    <p style="font-size: 0.75rem; color: #94a3b8;">Sécurité: Ne partagez jamais ces identifiants.</p>
                </div>
            `
        });
        console.log("Credentials email sent to", email, "role:", role, "MessageId:", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending credentials:", error);
        return false;
    }
};
