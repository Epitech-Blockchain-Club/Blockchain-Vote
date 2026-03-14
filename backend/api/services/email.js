import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Fallback to Resend API because Render blocks SMTP ports 465/587
const RESEND_API_URL = 'https://api.resend.com/emails';

/**
 * Mock transporter for compatibility with health check
 */
export const transporter = {
    options: {
        host: 'api.resend.com (HTTP)',
        port: 443,
        secure: true
    },
    verify: async (callback) => {
        try {
            const apiKey = process.env.SMTP_PASS;
            if (!apiKey) throw new Error("RESEND_API_KEY (via SMTP_PASS) is missing");
            // Simple check by listing domains/sending test?
            // Actually, we just check if key exists and we can reach the API
            const res = await fetch('https://api.resend.com/domains', {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            if (res.status === 401) callback(new Error("Invalid API Key"));
            else if (!res.ok) callback(new Error(`API Error: ${res.statusText}`));
            else callback(null, true);
        } catch (e) {
            callback(e);
        }
    }
};

/**
 * Send invitation email using Resend API
 */
export const sendModeratorInvitation = async (email, electionTitle, sessionTitle, portalLink) => {
    try {
        const apiKey = process.env.SMTP_PASS;
        const from = process.env.SMTP_FROM || 'onboarding@resend.dev';

        const res = await fetch(RESEND_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                from: from,
                to: [email],
                subject: `[Moderation] Invitation pour le scrutin: ${electionTitle}`,
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
                `
            })
        });

        const data = await res.json();
        if (res.ok) {
            console.log("Moderator invitation sent via Resend API. ID:", data.id);
            return true;
        } else {
            console.error("Resend API Error:", data);
            return false;
        }
    } catch (error) {
        console.error("Error sending email via API:", error);
        return false;
    }
};

/**
 * Notify admin of moderator decision
 */
export const notifyAdminOfDecision = async (adminEmail, result, moderatorEmail, sessionTitle) => {
    try {
        const apiKey = process.env.SMTP_PASS;
        const from = process.env.SMTP_FROM || 'onboarding@resend.dev';
        const isApproved = result === 'validate';

        const res = await fetch(RESEND_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                from: from,
                to: [adminEmail],
                subject: `[Alerte Admin] Décision modérateur pour "${sessionTitle}"`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
                        <h3 style="color: ${isApproved ? '#059669' : '#dc2626'}">
                            Décision: ${isApproved ? 'VALIDÉE' : 'INVALIDÉE'}
                        </h3>
                        <p>Le modérateur <strong>${moderatorEmail}</strong> a rendu son verdict pour la session <strong>"${sessionTitle}"</strong>.</p>
                        <p>Le consensus de l'élection est mis à jour en conséquence.</p>
                    </div>
                `
            })
        });
        return res.ok;
    } catch (error) {
        console.error("Error notifying admin via API:", error);
        return false;
    }
};

/**
 * Send temporary credentials using Resend API
 */
export const sendCredentials = async (email, name, password, role, orgName = null) => {
    try {
        const apiKey = process.env.SMTP_PASS;
        const from = process.env.SMTP_FROM || 'onboarding@resend.dev';
        const isSuper = role === 'superadmin';
        const roleLabel = isSuper ? 'Super Admin' : 'Administrateur';

        const res = await fetch(RESEND_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                from: from,
                to: [email],
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
                            <a href="https://blockchain-vote.onrender.com/login" style="background-color: #0f172a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px;">Se connecter à VoteChain</a>
                        </div>
                        <p style="font-size: 11px; color: #94a3b8; text-align: center;">Ne partagez jamais ces identifiants.</p>
                    </div>
                `
            })
        });
        return res.ok;
    } catch (error) {
        console.error("Error sending credentials via API:", error);
        return false;
    }
};
