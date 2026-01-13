import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const BASE_URL = "https://pret-finom.co";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============= EMAIL TEMPLATES =============

const baseStyles = `
  body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #F8FAFC; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #FE42B4 0%, #D61F8D 100%); padding: 40px 30px; text-align: center; }
  .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
  .content { padding: 40px 30px; }
  .footer { background: #F1F5F9; padding: 30px; text-align: center; font-size: 12px; color: #64748B; line-height: 1.6; }
  .footer a { color: #FE42B4; text-decoration: underline; }
  .footer-legal { margin-top: 15px; padding-top: 15px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8; }
  .button { display: inline-block; background: #FE42B4; color: white !important; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 700; margin: 20px 0; }
  .button:hover { background: #D61F8D; }
  .info-box { background: #F8FAFC; border-radius: 12px; padding: 20px; margin: 20px 0; }
  .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E2E8F0; }
  .info-row:last-child { border-bottom: none; }
  .label { color: #64748B; font-size: 14px; }
  .value { color: #0F172A; font-weight: 600; font-size: 14px; }
  h2 { color: #0F172A; font-size: 24px; font-weight: 700; margin-bottom: 20px; }
  p { color: #475569; line-height: 1.6; margin-bottom: 16px; }
  .highlight { color: #FE42B4; font-weight: 700; }
  .status-badge { display: inline-block; padding: 6px 16px; border-radius: 50px; font-size: 13px; font-weight: 600; }
  .status-pending { background: #FEF3C7; color: #92400E; }
  .status-approved { background: #D1FAE5; color: #065F46; }
  .status-rejected { background: #FEE2E2; color: #991B1B; }
  .warning-box { background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 12px; padding: 16px; margin: 20px 0; }
  .warning-box p { color: #92400E; margin: 0; font-size: 13px; }
`;

// Footer légal harmonisé pour tous les templates
const legalFooter = `
  <div class="footer">
    <p><strong>FINOM Payments B.V.</strong></p>
    <p>Siège social : Weteringschans 165C, 1017XD Amsterdam, Pays-Bas</p>
    <p>Établissement secondaire : 75008 Paris, France</p>
    <p><a href="${BASE_URL}">pret-finom.co</a> | <a href="mailto:contact@pret-finom.co">contact@pret-finom.co</a></p>
    <div class="footer-legal">
      <p>FINOM Payments B.V. est enregistrée sous le n° KVK 75aboratoire849584 auprès du registre du commerce néerlandais.</p>
      <p>Établissement de monnaie électronique agréé par De Nederlandsche Bank (DNB).</p>
      <p><a href="${BASE_URL}/legal">Mentions légales</a> | <a href="${BASE_URL}/privacy">Confidentialité</a> | <a href="${BASE_URL}/terms">CGU</a></p>
    </div>
  </div>
`;

interface TemplateData {
  firstName?: string;
  email?: string;
  loanId?: string;
  amount?: number;
  duration?: number;
  monthlyPayment?: number;
  rate?: number;
  reason?: string;
  documents?: string[];
  scheduledAt?: string;
  agentName?: string;
  title?: string;
  message?: string;
  ctaText?: string;
  ctaUrl?: string;
  beneficiary?: string;
  reference?: string;
  resetLink?: string;
}

const generateTemplate = (template: string, data: TemplateData): { subject: string; html: string } => {
  const templates: Record<string, () => { subject: string; html: string }> = {
    welcome: () => ({
      subject: "Bienvenue chez FINOM ! 🎉",
      html: `
        <!DOCTYPE html>
        <html><head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header"><h1>FINOM</h1></div>
            <div class="content">
              <h2>Bienvenue ${data.firstName || ''} ! 👋</h2>
              <p>Nous sommes ravis de vous accueillir chez FINOM, votre partenaire de confiance pour vos projets de financement.</p>
              <p>Votre compte a été créé avec succès avec l'adresse email <span class="highlight">${data.email || ''}</span>.</p>
              <div class="info-box">
                <h3 style="margin-top: 0;">Prochaines étapes :</h3>
                <p>✅ Complétez votre profil</p>
                <p>✅ Simulez votre premier prêt</p>
                <p>✅ Déposez votre demande en ligne</p>
              </div>
              <a href="${BASE_URL}/dashboard" class="button">Accéder à mon espace</a>
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),

    passwordReset: () => ({
      subject: "Réinitialisation de votre mot de passe 🔐",
      html: `
        <!DOCTYPE html>
        <html><head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header"><h1>FINOM</h1></div>
            <div class="content">
              <h2>Réinitialisation de mot de passe</h2>
              <p>Bonjour ${data.firstName || ''},</p>
              <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
              <div style="text-align: center;">
                <a href="${data.resetLink || `${BASE_URL}/reset-password`}" class="button">Réinitialiser mon mot de passe</a>
              </div>
              <div class="warning-box">
                <p>⚠️ Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
              </div>
              <p style="font-size: 13px; color: #94A3B8;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
              <p style="font-size: 12px; word-break: break-all; color: #64748B;">${data.resetLink || `${BASE_URL}/reset-password`}</p>
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),

    loanSubmitted: () => ({
      subject: "Votre demande de prêt a été soumise ✅",
      html: `
        <!DOCTYPE html>
        <html><head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header"><h1>FINOM</h1></div>
            <div class="content">
              <h2>Demande de prêt enregistrée</h2>
              <p>Bonjour ${data.firstName || ''},</p>
              <p>Nous avons bien reçu votre demande de prêt. Votre dossier est en cours d'analyse par nos experts.</p>
              <div class="info-box">
                <div class="info-row"><span class="label">Référence</span><span class="value">#${(data.loanId || '').slice(0, 8).toUpperCase()}</span></div>
                <div class="info-row"><span class="label">Montant demandé</span><span class="value">${(data.amount || 0).toLocaleString('fr-FR')} €</span></div>
                <div class="info-row"><span class="label">Durée</span><span class="value">${data.duration || 0} mois</span></div>
                <div class="info-row"><span class="label">Mensualité estimée</span><span class="value">${(data.monthlyPayment || 0).toLocaleString('fr-FR')} €</span></div>
                <div class="info-row"><span class="label">Statut</span><span class="status-badge status-pending">En attente</span></div>
              </div>
              <p>Un conseiller vous contactera sous 24h pour finaliser votre dossier.</p>
              <a href="${BASE_URL}/loans" class="button">Suivre ma demande</a>
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),

    loanApproved: () => ({
      subject: "Excellente nouvelle ! Votre prêt est approuvé 🎉",
      html: `
        <!DOCTYPE html>
        <html><head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header"><h1>FINOM</h1></div>
            <div class="content">
              <h2>Félicitations ${data.firstName || ''} ! 🎉</h2>
              <p>Nous avons le plaisir de vous annoncer que votre demande de prêt a été <span class="highlight">approuvée</span>.</p>
              <div class="info-box">
                <div class="info-row"><span class="label">Référence</span><span class="value">#${(data.loanId || '').slice(0, 8).toUpperCase()}</span></div>
                <div class="info-row"><span class="label">Montant accordé</span><span class="value">${(data.amount || 0).toLocaleString('fr-FR')} €</span></div>
                <div class="info-row"><span class="label">Taux</span><span class="value">${data.rate || 0}%</span></div>
                <div class="info-row"><span class="label">Mensualité</span><span class="value">${(data.monthlyPayment || 0).toLocaleString('fr-FR')} €</span></div>
                <div class="info-row"><span class="label">Statut</span><span class="status-badge status-approved">Approuvé</span></div>
              </div>
              <p>Les fonds seront débloqués après signature électronique de votre contrat.</p>
              <a href="${BASE_URL}/loans" class="button">Voir mon dossier</a>
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),

    loanRejected: () => ({
      subject: "Mise à jour de votre demande de prêt",
      html: `
        <!DOCTYPE html>
        <html><head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header"><h1>FINOM</h1></div>
            <div class="content">
              <h2>Bonjour ${data.firstName || ''}</h2>
              <p>Après analyse de votre dossier, nous ne sommes malheureusement pas en mesure de donner suite à votre demande de prêt.</p>
              <div class="info-box">
                <div class="info-row"><span class="label">Référence</span><span class="value">#${(data.loanId || '').slice(0, 8).toUpperCase()}</span></div>
                <div class="info-row"><span class="label">Statut</span><span class="status-badge status-rejected">Non retenu</span></div>
                ${data.reason ? `<div class="info-row"><span class="label">Motif</span><span class="value">${data.reason}</span></div>` : ''}
              </div>
              <p>Cette décision ne préjuge en rien de l'évolution future de votre situation. N'hésitez pas à nous recontacter.</p>
              <a href="${BASE_URL}/contact" class="button">Contacter un conseiller</a>
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),

    documentRequired: () => ({
      subject: "Documents requis pour votre dossier 📄",
      html: `
        <!DOCTYPE html>
        <html><head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header"><h1>FINOM</h1></div>
            <div class="content">
              <h2>Documents en attente</h2>
              <p>Bonjour ${data.firstName || ''},</p>
              <p>Pour finaliser l'analyse de votre dossier <span class="highlight">#${(data.loanId || '').slice(0, 8).toUpperCase()}</span>, nous avons besoin des documents suivants :</p>
              <div class="info-box">
                ${(data.documents || []).map(doc => `<p>📎 ${doc}</p>`).join('')}
              </div>
              <a href="${BASE_URL}/dashboard" class="button">Déposer mes documents</a>
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),

    callbackReminder: () => ({
      subject: "Rappel : Votre conseiller vous rappelle bientôt 📞",
      html: `
        <!DOCTYPE html>
        <html><head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header"><h1>FINOM</h1></div>
            <div class="content">
              <h2>Rappel de rendez-vous</h2>
              <p>Bonjour ${data.firstName || ''},</p>
              <p>Nous vous rappelons que votre conseiller <span class="highlight">${data.agentName || ''}</span> vous appellera :</p>
              <div class="info-box" style="text-align: center;">
                <p style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;">${data.scheduledAt || ''}</p>
              </div>
              <p>Merci de vous assurer d'être disponible à ce créneau.</p>
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),

    notification: () => ({
      subject: data.title || "Notification FINOM",
      html: `
        <!DOCTYPE html>
        <html><head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header"><h1>FINOM</h1></div>
            <div class="content">
              <h2>${data.title || ''}</h2>
              <p>Bonjour ${data.firstName || ''},</p>
              <p>${data.message || ''}</p>
              ${data.ctaText && data.ctaUrl ? `<a href="${data.ctaUrl.startsWith('http') ? data.ctaUrl : BASE_URL + data.ctaUrl}" class="button">${data.ctaText}</a>` : ''}
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),

    transferCompleted: () => ({
      subject: "Virement effectué ✅",
      html: `
        <!DOCTYPE html>
        <html><head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header"><h1>FINOM</h1></div>
            <div class="content">
              <h2>Virement confirmé</h2>
              <p>Bonjour ${data.firstName || ''},</p>
              <p>Votre virement a été exécuté avec succès.</p>
              <div class="info-box">
                <div class="info-row"><span class="label">Montant</span><span class="value">${(data.amount || 0).toLocaleString('fr-FR')} €</span></div>
                <div class="info-row"><span class="label">Bénéficiaire</span><span class="value">${data.beneficiary || ''}</span></div>
                ${data.reference ? `<div class="info-row"><span class="label">Référence</span><span class="value">${data.reference}</span></div>` : ''}
              </div>
              <a href="${BASE_URL}/banking" class="button">Voir mes transactions</a>
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),
  };

  const templateFn = templates[template];
  if (!templateFn) {
    throw new Error(`Template "${template}" not found`);
  }
  return templateFn();
};

// ============= REQUEST TYPES =============

interface EmailRequest {
  template: string;
  to: string;
  data: TemplateData;
}

// ============= HANDLER =============

const handler = async (req: Request): Promise<Response> => {
  console.log("send-email function called", req.method);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { template, to, data }: EmailRequest = await req.json();

    console.log("Sending email:", { template, to, data });

    // Generate email content
    const emailContent = generateTemplate(template, data);

    // Send email via Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "FINOM <onboarding@resend.dev>",
        to: [to],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", result);
      throw new Error(result.message || "Failed to send email");
    }

    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-email function:", errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
