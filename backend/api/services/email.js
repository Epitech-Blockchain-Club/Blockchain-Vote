import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const smtpPort = parseInt(process.env.SMTP_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2',
  },
});

// From doit correspondre exactement au compte SMTP pour éviter le spam
const SMTP_FROM = process.env.SMTP_USER
  ? `"EpiVote" <${process.env.SMTP_USER}>`
  : (process.env.SMTP_FROM || '"EpiVote" <noreply@epivote.epitech.eu>');
const REPLY_TO = process.env.SMTP_FROM || 'noreply@epivote.epitech.eu';

const baseHeaders = {
  'List-Unsubscribe': `<mailto:${process.env.SMTP_USER || 'noreply@epivote.epitech.eu'}?subject=unsubscribe>`,
  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  'X-Mailer': 'EpiVote Mailer',
  'Precedence': 'bulk',
};

transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP Connection Error:", error);
  } else {
    console.log("SMTP Server is ready to take our messages");
  }
});

// ─── Shared Design Tokens ────────────────────────────────────────────────
const BRAND_COLOR = '#2563eb';
const BRAND_DARK = '#0f172a';
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>EpiVote</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:${FONT};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <!-- Card -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header banner -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND_COLOR} 0%,#1d4ed8 50%,#1e40af 100%);padding:36px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:8px 16px;">
                      <span style="font-size:18px;font-weight:900;color:#ffffff;letter-spacing:-0.025em;">EpiVote</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;font-size:10px;font-weight:700;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.15em;padding-top:6px;">Blockchain Voting</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;line-height:1.6;">
                Cet email est confidentiel et destiné uniquement à son destinataire.<br/>
                © ${new Date().getFullYear()} EpiVote by Epitech Blockchain Club · Ne pas répondre à cet email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const badge = (text, bg, color) => `
  <span style="display:inline-block;background:${bg};color:${color};font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;padding:4px 10px;border-radius:6px;">${text}</span>
`;

const infoRow = (label, value) => `
  <tr>
    <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;">
      <p style="margin:0 0 2px 0;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;">${label}</p>
      <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">${value}</p>
    </td>
  </tr>
`;

const ctaButton = (href, text) => `
  <div style="text-align:center;margin:32px 0;">
    <a href="${href}" style="display:inline-block;background:${BRAND_DARK};color:#ffffff;padding:16px 40px;text-decoration:none;border-radius:14px;font-weight:800;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;">
      ${text}
    </a>
    <p style="margin:12px 0 0;font-size:11px;color:#94a3b8;">Ou copiez ce lien : <a href="${href}" style="color:${BRAND_COLOR};text-decoration:none;word-break:break-all;">${href}</a></p>
  </div>
`;

// ─── sendModeratorInvitation ─────────────────────────────────────────────
export const sendModeratorInvitation = async (email, electionTitle, sessionTitle, portalLink) => {
  try {
    const body = emailWrapper(`
      <h2 style="margin:0 0 6px;font-size:22px;font-weight:900;color:${BRAND_DARK};letter-spacing:-0.025em;">
        Invitation à modérer
      </h2>
      <p style="margin:0 0 28px;font-size:14px;color:#64748b;">
        Vous avez été désigné comme modérateur pour la session ci-dessous.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:6px 20px;margin-bottom:28px;">
        <tbody>
          ${infoRow('Scrutin', electionTitle)}
          ${infoRow('Session à valider', `<span style="color:${BRAND_COLOR};font-weight:800;">${sessionTitle}</span>`)}
        </tbody>
      </table>

      <p style="font-size:14px;color:#475569;line-height:1.7;margin-bottom:8px;">
        Votre validation est <strong>indispensable</strong> pour permettre l'ouverture du vote. Examinez les paramètres techniques via le lien sécurisé ci-dessous.
      </p>

      ${ctaButton(portalLink, 'Accéder au portail de validation')}

      <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:14px 18px;margin-top:8px;">
        <p style="margin:0;font-size:12px;font-weight:700;color:#92400e;">
          Lien à usage unique. Une fois votre décision soumise, ce lien sera désactivé.
        </p>
      </div>
    `);

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      replyTo: REPLY_TO,
      to: email,
      subject: `Invitation à modérer — ${electionTitle}`,
      text: `Bonjour,\n\nVous avez été désigné modérateur pour la session "${sessionTitle}" du scrutin "${electionTitle}".\n\nAccédez au portail : ${portalLink}\n\nCordialement,\nL'équipe EpiVote`,
      html: body,
      headers: baseHeaders,
    });
    console.log("Moderator invitation sent to", email, "MessageId:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

// ─── notifyAdminOfDecision ────────────────────────────────────────────────
export const notifyAdminOfDecision = async (adminEmail, result, moderatorEmail, sessionTitle) => {
  try {
    const isApproved = result === 'validate';
    const statusColor = isApproved ? '#059669' : '#dc2626';
    const statusBg = isApproved ? '#ecfdf5' : '#fef2f2';
    const statusLabel = isApproved ? 'Validée ✓' : 'Invalidée ✗';

    const body = emailWrapper(`
      <div style="display:inline-block;margin-bottom:20px;">
        ${badge(statusLabel, statusBg, statusColor)}
      </div>
      <h2 style="margin:0 0 6px;font-size:22px;font-weight:900;color:${BRAND_DARK};">
        Décision du modérateur
      </h2>
      <p style="margin:0 0 28px;font-size:14px;color:#64748b;">
        Un modérateur vient de rendre son verdict sur une session.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:6px 20px;margin-bottom:28px;">
        <tbody>
          ${infoRow('Session concernée', sessionTitle)}
          ${infoRow('Modérateur', moderatorEmail)}
          ${infoRow('Décision', `<span style="color:${statusColor};font-weight:900;">${statusLabel}</span>`)}
          ${infoRow('Date & heure', new Date().toLocaleString('fr-FR'))}
        </tbody>
      </table>

      <p style="font-size:14px;color:#475569;line-height:1.7;">
        Le consensus de l'élection a été mis à jour en conséquence. Rendez-vous sur le dashboard EpiVote pour visualiser l'état global.
      </p>
    `);

    await transporter.sendMail({
      from: SMTP_FROM,
      replyTo: REPLY_TO,
      to: adminEmail,
      subject: `Verdict modérateur — ${sessionTitle}`,
      text: `Le modérateur ${moderatorEmail} a ${isApproved ? 'validé' : 'invalidé'} la session "${sessionTitle}".`,
      html: body,
      headers: baseHeaders,
    });
    return true;
  } catch (error) {
    console.error("Error notifying admin:", error);
    return false;
  }
};

// ─── sendModeratorMonitorLink ────────────────────────────────────────────
export const sendModeratorMonitorLink = async (email, electionTitle, sessionTitle, monitorLink) => {
  try {
    const body = emailWrapper(`
      <div style="margin-bottom:20px;">
        ${badge('Consensus atteint ✓', '#ecfdf5', '#059669')}
      </div>
      <h2 style="margin:0 0 6px;font-size:22px;font-weight:900;color:${BRAND_DARK};letter-spacing:-0.025em;">
        Session validée — suivi en direct
      </h2>
      <p style="margin:0 0 28px;font-size:14px;color:#64748b;">
        L'ensemble des modérateurs ont validé la session ci-dessous. Le vote est maintenant ouvert.
        Vous pouvez suivre l'avancement en temps réel via le lien sécurisé ci-dessous.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:6px 20px;margin-bottom:28px;">
        <tbody>
          ${infoRow('Scrutin', electionTitle)}
          ${infoRow('Session validée', `<span style="color:#059669;font-weight:800;">${sessionTitle}</span>`)}
        </tbody>
      </table>

      ${ctaButton(monitorLink, 'Suivre le vote en direct')}

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:14px 18px;margin-top:8px;">
        <p style="margin:0;font-size:12px;font-weight:700;color:#1e40af;">
          Ce lien ne expire pas. Une authentification Google ou Office 365 est requise pour y accéder.
        </p>
      </div>
    `);

    await transporter.sendMail({
      from: SMTP_FROM,
      replyTo: REPLY_TO,
      to: email,
      subject: `Suivi en direct — ${electionTitle}`,
      text: `La session "${sessionTitle}" du scrutin "${electionTitle}" a atteint le consensus. Suivez le vote : ${monitorLink}`,
      html: body,
      headers: baseHeaders,
    });
    console.log("Monitor link sent to", email);
    return true;
  } catch (error) {
    console.error("Error sending monitor link:", error);
    return false;
  }
};

// ─── sendVoterAdditionRequest ─────────────────────────────────────────────
export const sendVoterAdditionRequest = async (moderatorEmail, scrutinTitle, sessionTitle, emails, reviewLink) => {
  try {
    const emailList = emails.slice(0, 10).map(e =>
      `<li style="font-size:12px;font-family:monospace;color:#475569;padding:4px 0;border-bottom:1px solid #f1f5f9;">${e}</li>`
    ).join('');
    const more = emails.length > 10 ? `<li style="font-size:11px;color:#94a3b8;padding:4px 0;">… et ${emails.length - 10} autre(s)</li>` : '';

    const body = emailWrapper(`
      <div style="margin-bottom:20px;">
        ${badge('Demande en attente', '#fef3c7', '#92400e')}
      </div>
      <h2 style="margin:0 0 6px;font-size:22px;font-weight:900;color:${BRAND_DARK};letter-spacing:-0.025em;">
        Ajout d'électeurs — validation requise
      </h2>
      <p style="margin:0 0 28px;font-size:14px;color:#64748b;">
        Un administrateur demande l'ajout de <strong>${emails.length} électeur(s)</strong> à la session ci-dessous. Votre validation est requise.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:6px 20px;margin-bottom:20px;">
        <tbody>
          ${infoRow('Scrutin', scrutinTitle)}
          ${infoRow('Session', `<span style="color:${BRAND_COLOR};font-weight:800;">${sessionTitle}</span>`)}
          ${infoRow('Nombre d\'emails', `<strong>${emails.length}</strong>`)}
        </tbody>
      </table>

      <p style="margin:0 0 8px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;">Emails à ajouter</p>
      <ul style="margin:0 0 28px;padding:12px 20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;list-style:none;">
        ${emailList}${more}
      </ul>

      ${ctaButton(reviewLink, 'Examiner et répondre')}

      <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:14px 18px;margin-top:8px;">
        <p style="margin:0;font-size:12px;font-weight:700;color:#92400e;">
          Le consensus de 100% des modérateurs est requis pour que l'ajout soit effectif.
        </p>
      </div>
    `);

    await transporter.sendMail({
      from: SMTP_FROM,
      replyTo: REPLY_TO,
      to: moderatorEmail,
      subject: `Validation requise — Ajout d'électeurs · ${scrutinTitle}`,
      text: `Demande d'ajout de ${emails.length} électeur(s) à la session "${sessionTitle}" du scrutin "${scrutinTitle}".\n\nExaminer la demande : ${reviewLink}`,
      html: body,
      headers: baseHeaders,
    });
    return true;
  } catch (error) {
    console.error('Error sending voter addition request email:', error);
    return false;
  }
};

// ─── notifyAdminOfVoterAdditionDecision ──────────────────────────────────────
export const notifyAdminOfVoterAdditionDecision = async (adminEmail, moderatorEmail, decision, reason, scrutinTitle, sessionTitle, pendingCount, totalCount) => {
  try {
    const isApproved = decision === 'validate';
    const statusColor = isApproved ? '#059669' : '#dc2626';
    const statusBg = isApproved ? '#ecfdf5' : '#fef2f2';
    const statusLabel = isApproved ? 'Validé ✓' : 'Invalidé ✗';

    const body = emailWrapper(`
      <div style="margin-bottom:20px;">
        ${badge(statusLabel, statusBg, statusColor)}
      </div>
      <h2 style="margin:0 0 6px;font-size:22px;font-weight:900;color:${BRAND_DARK};">
        Décision sur l'ajout d'électeurs
      </h2>
      <p style="margin:0 0 28px;font-size:14px;color:#64748b;">
        Un modérateur a rendu son verdict sur votre demande d'ajout d'électeurs.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:6px 20px;margin-bottom:28px;">
        <tbody>
          ${infoRow('Scrutin', scrutinTitle)}
          ${infoRow('Session', sessionTitle)}
          ${infoRow('Modérateur', moderatorEmail)}
          ${infoRow('Décision', `<span style="color:${statusColor};font-weight:900;">${statusLabel}</span>`)}
          ${reason ? infoRow('Raison', `<em style="color:#dc2626;">${reason}</em>`) : ''}
          ${infoRow('Validations reçues', `${pendingCount} / ${totalCount}`)}
          ${infoRow('Date & heure', new Date().toLocaleString('fr-FR'))}
        </tbody>
      </table>

      <p style="font-size:14px;color:#475569;line-height:1.7;">
        Consultez le tableau de bord pour suivre l'état de la demande en temps réel.
      </p>
    `);

    await transporter.sendMail({
      from: SMTP_FROM,
      replyTo: REPLY_TO,
      to: adminEmail,
      subject: `Décision modérateur — Ajout d'électeurs · ${scrutinTitle}`,
      text: `Le modérateur ${moderatorEmail} a ${isApproved ? 'validé' : 'invalidé'} l'ajout d'électeurs pour la session "${sessionTitle}".${reason ? `\nRaison : ${reason}` : ''}`,
      html: body,
      headers: baseHeaders,
    });
    return true;
  } catch (error) {
    console.error('Error notifying admin of voter addition decision:', error);
    return false;
  }
};

// ─── notifyAdminVoterAdditionApproved ────────────────────────────────────────
export const notifyAdminVoterAdditionApproved = async (adminEmail, emails, scrutinTitle, sessionTitle) => {
  try {
    const emailList = emails.slice(0, 10).map(e =>
      `<li style="font-size:12px;font-family:monospace;color:#059669;padding:4px 0;border-bottom:1px solid #f0fdf4;">${e}</li>`
    ).join('');
    const more = emails.length > 10 ? `<li style="font-size:11px;color:#94a3b8;padding:4px 0;">… et ${emails.length - 10} autre(s)</li>` : '';

    const body = emailWrapper(`
      <div style="margin-bottom:20px;">
        ${badge('Ajout approuvé ✓', '#ecfdf5', '#059669')}
      </div>
      <h2 style="margin:0 0 6px;font-size:22px;font-weight:900;color:${BRAND_DARK};">
        Électeurs ajoutés avec succès
      </h2>
      <p style="margin:0 0 28px;font-size:14px;color:#64748b;">
        Le consensus de 100% des modérateurs a été atteint. <strong>${emails.length} électeur(s)</strong> ont été ajoutés à la session et peuvent désormais voter.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:6px 20px;margin-bottom:20px;">
        <tbody>
          ${infoRow('Scrutin', scrutinTitle)}
          ${infoRow('Session', `<span style="color:#059669;font-weight:800;">${sessionTitle}</span>`)}
          ${infoRow('Électeurs ajoutés', `<strong style="color:#059669;">${emails.length}</strong>`)}
        </tbody>
      </table>

      <p style="margin:0 0 8px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;">Emails ajoutés</p>
      <ul style="margin:0;padding:12px 20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;list-style:none;">
        ${emailList}${more}
      </ul>
    `);

    await transporter.sendMail({
      from: SMTP_FROM,
      replyTo: REPLY_TO,
      to: adminEmail,
      subject: `✓ Électeurs ajoutés — ${scrutinTitle}`,
      text: `${emails.length} électeur(s) ont été ajoutés à la session "${sessionTitle}" du scrutin "${scrutinTitle}" suite au consensus des modérateurs.`,
      html: body,
      headers: baseHeaders,
    });
    return true;
  } catch (error) {
    console.error('Error sending voter addition approved email:', error);
    return false;
  }
};

// ─── notifyAdminVoterAdditionRejected ────────────────────────────────────────
export const notifyAdminVoterAdditionRejected = async (adminEmail, moderatorEmail, reason, scrutinTitle, sessionTitle) => {
  try {
    const body = emailWrapper(`
      <div style="margin-bottom:20px;">
        ${badge('Ajout rejeté ✗', '#fef2f2', '#dc2626')}
      </div>
      <h2 style="margin:0 0 6px;font-size:22px;font-weight:900;color:${BRAND_DARK};">
        Demande d'ajout d'électeurs rejetée
      </h2>
      <p style="margin:0 0 28px;font-size:14px;color:#64748b;">
        Un modérateur a invalidé votre demande d'ajout d'électeurs. L'ajout n'a pas été effectué.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:6px 20px;margin-bottom:28px;">
        <tbody>
          ${infoRow('Scrutin', scrutinTitle)}
          ${infoRow('Session', sessionTitle)}
          ${infoRow('Modérateur ayant invalidé', moderatorEmail)}
          ${reason ? infoRow('Raison fournie', `<em style="color:#dc2626;">${reason}</em>`) : ''}
        </tbody>
      </table>

      <p style="font-size:14px;color:#475569;line-height:1.7;">
        Vous pouvez soumettre une nouvelle demande depuis le tableau de bord si nécessaire.
      </p>
    `);

    await transporter.sendMail({
      from: SMTP_FROM,
      replyTo: REPLY_TO,
      to: adminEmail,
      subject: `✗ Ajout d'électeurs rejeté — ${scrutinTitle}`,
      text: `Votre demande d'ajout d'électeurs à la session "${sessionTitle}" a été rejetée par ${moderatorEmail}.${reason ? `\nRaison : ${reason}` : ''}`,
      html: body,
      headers: baseHeaders,
    });
    return true;
  } catch (error) {
    console.error('Error sending voter addition rejected email:', error);
    return false;
  }
};

// ─── sendCredentials ──────────────────────────────────────────────────────
export const sendCredentials = async (email, name, password, role, orgName = null) => {
  try {
    const isSuper = role === 'superadmin';
    const roleLabel = isSuper ? 'Super Admin' : 'Administrateur';
    const roleBadgeColor = isSuper ? '#7c3aed' : '#2563eb';

    if (!process.env.FRONTEND_URL) {
      console.error("[\x1b[31mCONFIG ERROR\x1b[0m] FRONTEND_URL is not set in environment variables! Email links will be broken.");
    }
    const loginUrl = `${process.env.FRONTEND_URL || ''}/admin-login`;

    const body = emailWrapper(`
      <h2 style="margin:0 0 6px;font-size:22px;font-weight:900;color:${BRAND_DARK};">
        Bienvenue sur EpiVote
      </h2>
      <p style="margin:0 0 6px;font-size:14px;color:#64748b;">Bonjour <strong style="color:${BRAND_DARK};">${name || email}</strong>,</p>
      <div style="margin-bottom:24px;">
        ${badge(roleLabel, roleBadgeColor + '15', roleBadgeColor)}
        ${orgName ? badge(orgName, '#e0f2fe', '#0369a1') : ''}
      </div>

      <p style="font-size:14px;color:#475569;line-height:1.7;margin-bottom:28px;">
        Un compte <strong>${roleLabel}</strong> a été créé pour vous${orgName ? ` au sein de l'organisation <strong>${orgName}</strong>` : ''} sur la plateforme de vote blockchain EpiVote. Voici vos identifiants de connexion.
      </p>

      <!-- Credentials Box -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_DARK};border-radius:16px;padding:0;margin-bottom:28px;overflow:hidden;">
        <tr>
          <td style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);">
            <p style="margin:0 0 4px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:rgba(255,255,255,0.4);">Email</p>
            <p style="margin:0;font-size:15px;font-weight:700;color:#ffffff;font-family:monospace;">${email}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0 0 4px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:rgba(255,255,255,0.4);">Mot de passe temporaire</p>
            <p style="margin:0;font-size:22px;font-weight:900;color:#60a5fa;letter-spacing:0.06em;font-family:monospace;">${password}</p>
          </td>
        </tr>
      </table>

      ${ctaButton(loginUrl, 'Se connecter maintenant')}

      <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:14px 18px;">
        <p style="margin:0;font-size:12px;font-weight:700;color:#92400e;">
          Securite : Veuillez changer votre mot de passe des votre premiere connexion. Ne partagez jamais ces identifiants.
        </p>
      </div>
    `);

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      replyTo: REPLY_TO,
      to: email,
      subject: `Vos identifiants EpiVote — ${roleLabel}${orgName ? ` (${orgName})` : ''}`,
      text: `Bonjour ${name || email},\n\nUn compte ${roleLabel} a été créé pour vous sur EpiVote.\n\nEmail : ${email}\nMot de passe temporaire : ${password}\n\nConnectez-vous ici : ${loginUrl}\n\nChangez votre mot de passe dès la première connexion.\n\nCordialement,\nL'équipe EpiVote`,
      html: body,
      headers: baseHeaders,
    });
    console.log("Credentials email sent to", email, "role:", role, "MessageId:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending credentials:", error);
    return false;
  }
};
