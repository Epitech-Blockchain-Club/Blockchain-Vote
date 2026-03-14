import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    // Fix for Render/Cloud environments: Force IPv4 to avoid ENETUNREACH on IPv6
    family: 4,
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,   // 10 seconds
    socketTimeout: 30000,     // 30 seconds
    tls: {
        // Many cloud providers work better with standard TLS settings on 465
        rejectUnauthorized: true
    }
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
                <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #fcfcfd; border: 1px solid #f1f5f9; border-radius: 24px; color: #1e293b;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="display: inline-block; padding: 12px; background-color: #2563eb; border-radius: 16px; margin-bottom: 16px;">
                            <img src="https://antigravity.aptely.io/logo-white.png" height="32" alt="VoteChain" style="display: block;" />
                        </div>
                        <h2 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Validation de Session</h2>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
                        Bonjour, vous avez été sollicité pour modérer la session <strong>"${sessionTitle}"</strong> dans le cadre du scrutin <strong>"${electionTitle}"</strong>.
                    </p>
                    
                    <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; margin-bottom: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                        <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8;">Scrutin</p>
                        <p style="margin: 0 0 16px 0; font-weight: 700; color: #0f172a;">${electionTitle}</p>
                        
                        <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8;">Session à valider</p>
                        <p style="margin: 0; font-weight: 700; color: #2563eb;">${sessionTitle}</p>
                    </div>

                    <p style="font-size: 14px; line-height: 1.5; color: #64748b; text-align: center; margin-bottom: 24px;">
                        Votre validation est indispensable pour permettre l'ouverture du vote. Veuillez examiner les paramètres techniques via ce lien sécurisé :
                    </p>

                    <div style="text-align: center; margin-bottom: 36px;">
                        <a href="${portalLink}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.2s;">
                            Accéder au Journal de Validation
                        </a>
                    </div>

                    <div style="padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center;">
                        <p style="font-size: 12px; font-weight: 600; color: #94a3b8; margin: 0 0 8px 0;">Sécurité VoteChain</p>
                        <p style="font-size: 11px; color: #cbd5e1; line-height: 1.4; margin: 0;">
                            Ceci est un lien à usage unique. Une fois votre décision validée, le lien sera désactivé.
                            Si le bouton ci-dessus ne s'affiche pas, copiez-collez : ${portalLink}
                        </p>
                    </div>
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
export const sendCredentials = async (email, name, password, role, orgName = null) => {
    try {
        const isSuper = role === 'superadmin';
        const roleLabel = isSuper ? 'Super Admin' : 'Administrateur';
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"VoteChain" <noreply@votechain.com>',
            to: email,
            subject: `[VoteChain] Vos identifiants ${roleLabel}${orgName ? ` — ${orgName}` : ''}`,
            html: `
                <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #fcfcfd; border: 1px solid #f1f5f9; border-radius: 24px; color: #1e293b;">
                    <h2 style="margin: 0 0 8px 0; color: #0f172a; font-size: 22px; font-weight: 800;">Bienvenue sur VoteChain</h2>
                    <p style="color: #64748b; margin-bottom: 24px;">Bonjour <strong>${name}</strong>,</p>
                    <p style="color: #475569; line-height: 1.6;">
                        Un compte <strong>${roleLabel}</strong> a été créé pour vous${orgName ? ` pour l'organisation <strong>${orgName}</strong>` : ''} sur la plateforme de vote blockchain VoteChain.
                    </p>
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px; margin: 24px 0;">
                        <p style="margin: 0 0 4px 0; color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Email</p>
                        <p style="margin: 0 0 16px 0; font-weight: 700; font-family: monospace; color: #0f172a;">${email}</p>
                        <p style="margin: 0 0 4px 0; color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Mot de passe temporaire</p>
                        <p style="margin: 0; font-weight: 800; font-family: monospace; font-size: 20px; color: #2563eb; letter-spacing: 0.05em;">${password}</p>
                    </div>
                    ${orgName ? `<p style="color: #475569; font-size: 14px;">Organisation assignée : <strong>${orgName}</strong></p>` : ''}
                    <p style="color: #64748b; font-size: 14px;">Veuillez vous connecter et changer votre mot de passe dès votre première visite.</p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="http://localhost:5173/login" style="background-color: #0f172a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px;">Se connecter à VoteChain</a>
                    </div>
                    <p style="font-size: 11px; color: #94a3b8; text-align: center;">Ne partagez jamais ces identifiants.</p>
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
