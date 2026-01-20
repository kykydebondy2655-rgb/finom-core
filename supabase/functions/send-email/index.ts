import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const BASE_URL = "https://pret-finom.co";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============= EMAIL TEMPLATES =============

const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  
  body { 
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; 
    margin: 0; 
    padding: 20px; 
    background: linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #FCE7F3 100%);
    min-height: 100vh;
  }
  
  .container { 
    max-width: 600px; 
    margin: 0 auto; 
    background: white; 
    border-radius: 24px; 
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(254, 66, 180, 0.05);
  }
  
  .header { 
    background: linear-gradient(135deg, #FE42B4 0%, #D61F8D 50%, #9333EA 100%); 
    padding: 50px 30px; 
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  
  .header::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
    animation: shimmer 3s infinite;
  }
  
  @keyframes shimmer {
    0%, 100% { transform: translateX(-50%) translateY(-50%) rotate(0deg); }
    50% { transform: translateX(-50%) translateY(-50%) rotate(180deg); }
  }
  
  .header h1 { 
    color: white; 
    margin: 0; 
    font-size: 32px; 
    font-weight: 900; 
    letter-spacing: -1px;
    position: relative;
    text-shadow: 0 2px 10px rgba(0,0,0,0.2);
  }
  
  .header-subtitle {
    color: rgba(255,255,255,0.9);
    font-size: 14px;
    margin-top: 8px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  
  .content { 
    padding: 48px 40px; 
  }
  
  .footer { 
    background: linear-gradient(to bottom, #F8FAFC, #F1F5F9); 
    padding: 35px 30px; 
    text-align: center; 
    font-size: 12px; 
    color: #64748B; 
    line-height: 1.7;
    border-top: 1px solid #E2E8F0;
  }
  
  .footer a { 
    color: #FE42B4; 
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
  }
  
  .footer a:hover { 
    color: #D61F8D; 
  }
  
  .footer-legal { 
    margin-top: 20px; 
    padding-top: 20px; 
    border-top: 1px solid #E2E8F0; 
    font-size: 11px; 
    color: #94A3B8;
  }
  
  .footer-links {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #E2E8F0;
  }
  
  .footer-links a {
    margin: 0 8px;
    color: #64748B;
    font-weight: 500;
  }
  
  .button { 
    display: inline-block; 
    background: linear-gradient(135deg, #FE42B4 0%, #D61F8D 100%); 
    color: white !important; 
    padding: 16px 40px; 
    border-radius: 50px; 
    text-decoration: none; 
    font-weight: 700; 
    font-size: 15px;
    margin: 25px 0;
    box-shadow: 0 10px 25px -5px rgba(254, 66, 180, 0.4), 0 4px 6px -2px rgba(254, 66, 180, 0.2);
    transition: all 0.3s ease;
    letter-spacing: 0.3px;
  }
  
  .button:hover { 
    background: linear-gradient(135deg, #D61F8D 0%, #9333EA 100%);
    transform: translateY(-2px);
    box-shadow: 0 15px 30px -5px rgba(254, 66, 180, 0.5);
  }
  
  .button-secondary {
    background: white;
    color: #FE42B4 !important;
    border: 2px solid #FE42B4;
    box-shadow: none;
  }
  
  .button-secondary:hover {
    background: #FFF5FA;
  }
  
  .info-box { 
    background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%); 
    border-radius: 16px; 
    padding: 24px; 
    margin: 28px 0;
    border: 1px solid #E2E8F0;
  }
  
  .info-row { 
    display: flex; 
    justify-content: space-between; 
    align-items: center;
    padding: 12px 0; 
    border-bottom: 1px solid #E2E8F0; 
  }
  
  .info-row:last-child { 
    border-bottom: none; 
    padding-bottom: 0;
  }
  
  .info-row:first-child {
    padding-top: 0;
  }
  
  .label { 
    color: #64748B; 
    font-size: 14px;
    font-weight: 500;
  }
  
  .value { 
    color: #0F172A; 
    font-weight: 700; 
    font-size: 14px; 
  }
  
  h2 { 
    color: #0F172A; 
    font-size: 28px; 
    font-weight: 800; 
    margin-bottom: 20px;
    letter-spacing: -0.5px;
    line-height: 1.3;
  }
  
  h3 {
    color: #0F172A;
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 16px 0;
  }
  
  p { 
    color: #475569; 
    line-height: 1.7; 
    margin-bottom: 16px;
    font-size: 15px;
  }
  
  .highlight { 
    color: #FE42B4; 
    font-weight: 700; 
  }
  
  .status-badge { 
    display: inline-block; 
    padding: 8px 18px; 
    border-radius: 50px; 
    font-size: 13px; 
    font-weight: 700;
    letter-spacing: 0.3px;
  }
  
  .status-pending { 
    background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); 
    color: #92400E; 
  }
  
  .status-approved { 
    background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%); 
    color: #065F46; 
  }
  
  .status-rejected { 
    background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%); 
    color: #991B1B; 
  }
  
  .status-offer {
    background: linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%);
    color: #C2410C;
  }
  
  .warning-box { 
    background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); 
    border: 1px solid #FCD34D; 
    border-radius: 16px; 
    padding: 20px; 
    margin: 24px 0;
  }
  
  .warning-box p { 
    color: #92400E; 
    margin: 0; 
    font-size: 14px;
    line-height: 1.6;
  }
  
  .success-box {
    background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
    border: 1px solid #6EE7B7;
    border-radius: 16px;
    padding: 20px;
    margin: 24px 0;
  }
  
  .success-box p {
    color: #065F46;
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
  }
  
  .icon-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    font-size: 28px;
  }
  
  .icon-success { background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%); }
  .icon-warning { background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); }
  .icon-info { background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%); }
  .icon-error { background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%); }
  .icon-primary { background: linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%); }
  
  .steps-list {
    margin: 24px 0;
    padding: 0;
    list-style: none;
  }
  
  .step-item {
    display: flex;
    align-items: flex-start;
    padding: 14px 0;
    border-bottom: 1px solid #F1F5F9;
  }
  
  .step-item:last-child {
    border-bottom: none;
  }
  
  .step-number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #FE42B4 0%, #D61F8D 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    margin-right: 16px;
    flex-shrink: 0;
  }
  
  .step-content {
    flex: 1;
  }
  
  .step-content strong {
    color: #0F172A;
    display: block;
    margin-bottom: 4px;
  }
  
  .step-content span {
    color: #64748B;
    font-size: 13px;
  }
  
  .credential-box {
    background: #0F172A;
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
  }
  
  .credential-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #334155;
  }
  
  .credential-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  .credential-row:first-child {
    padding-top: 0;
  }
  
  .credential-label {
    color: #94A3B8;
    font-size: 13px;
  }
  
  .credential-value {
    color: #FE42B4;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  
  .document-list {
    margin: 20px 0;
  }
  
  .document-item {
    display: flex;
    align-items: center;
    padding: 14px 16px;
    background: #F8FAFC;
    border-radius: 12px;
    margin-bottom: 10px;
    border: 1px solid #E2E8F0;
  }
  
  .document-item:last-child {
    margin-bottom: 0;
  }
  
  .document-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 14px;
    font-size: 18px;
  }
  
  .document-name {
    color: #0F172A;
    font-weight: 600;
    font-size: 14px;
  }
  
  .divider {
    height: 1px;
    background: linear-gradient(to right, transparent, #E2E8F0, transparent);
    margin: 32px 0;
  }
  
  .text-center { text-align: center; }
  .text-small { font-size: 13px; color: #94A3B8; }
  .text-muted { color: #64748B; }
  .mt-0 { margin-top: 0; }
  .mb-0 { margin-bottom: 0; }
`;

// Footer légal harmonisé pour tous les templates
const legalFooter = `
  <div class="footer">
    <p style="margin-bottom: 8px;"><strong>FINOM Payments B.V.</strong></p>
    <p style="margin-bottom: 4px;">Siège social : Weteringschans 165C, 1017XD Amsterdam, Pays-Bas</p>
    <p style="margin-bottom: 12px;">Établissement secondaire : 9 Rue du Quatre Septembre, 75002 Paris, France</p>
    <p><a href="${BASE_URL}">pret-finom.co</a> &nbsp;•&nbsp; <a href="mailto:contact@pret-finom.co">contact@pret-finom.co</a> &nbsp;•&nbsp; <a href="tel:+33183753520">+33 1 83 75 35 20</a></p>
    <div class="footer-legal">
      <p style="margin-bottom: 6px;">FINOM Payments B.V. est enregistrée sous le n° KVK 75849584 auprès du registre du commerce néerlandais.</p>
      <p style="margin-bottom: 0;">Établissement de monnaie électronique agréé et supervisé par De Nederlandsche Bank (DNB).</p>
    </div>
    <div class="footer-links">
      <a href="${BASE_URL}/legal">Mentions légales</a>
      <a href="${BASE_URL}/privacy">Confidentialité</a>
      <a href="${BASE_URL}/terms">CGU</a>
      <a href="${BASE_URL}/security-trust">Sécurité</a>
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
  documentName?: string;
  rejectionReason?: string;
  tempPassword?: string;
  loginUrl?: string;
  reflectionPeriod?: number;
}

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

const generateTemplate = (template: string, data: TemplateData): { subject: string; html: string } => {
  const templates: Record<string, () => { subject: string; html: string }> = {
    
    // ============= WELCOME =============
    welcome: () => ({
      subject: "Bienvenue chez FINOM – Votre espace client est prêt 🏦",
      html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>FINOM</h1>
              <p class="header-subtitle">Crédit Immobilier</p>
            </div>
            <div class="content">
              <div class="icon-circle icon-success">🎉</div>
              <h2 class="text-center">Bienvenue ${data.firstName || ''} !</h2>
              <p class="text-center">Nous sommes ravis de vous compter parmi nos clients. Votre compte FINOM est désormais actif et prêt à vous accompagner dans votre projet immobilier.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">📧 Email de connexion</span>
                  <span class="value">${data.email || ''}</span>
                </div>
                <div class="info-row">
                  <span class="label">✅ Statut du compte</span>
                  <span class="status-badge status-approved">Actif</span>
                </div>
              </div>
              
              <h3>Vos prochaines étapes</h3>
              <div class="steps-list">
                <div class="step-item">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <strong>Complétez votre profil</strong>
                    <span>Renseignez vos informations personnelles et professionnelles</span>
                  </div>
                </div>
                <div class="step-item">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <strong>Simulez votre prêt</strong>
                    <span>Estimez vos mensualités avec notre simulateur précis</span>
                  </div>
                </div>
                <div class="step-item">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <strong>Déposez votre demande</strong>
                    <span>Notre équipe analyse votre dossier sous 24h</span>
                  </div>
                </div>
              </div>
              
              <div class="text-center">
                <a href="${BASE_URL}/dashboard" class="button">Accéder à mon espace client</a>
              </div>
              
              <div class="divider"></div>
              
              <p class="text-small text-center">Une question ? Notre équipe d'experts est à votre disposition du lundi au vendredi de 9h à 18h.</p>
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),

    // ============= ACCOUNT OPENING =============
    accountOpening: () => ({
      subject: "🔐 Vos identifiants de connexion FINOM",
      html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>FINOM</h1>
              <p class="header-subtitle">Crédit Immobilier</p>
            </div>
            <div class="content">
              <div class="icon-circle icon-primary">🔐</div>
              <h2 class="text-center">Bienvenue ${data.firstName || ''} !</h2>
              <p class="text-center">Votre compte FINOM a été créé par notre équipe. Vous trouverez ci-dessous vos identifiants de connexion sécurisés.</p>
              
              <div class="credential-box">
                <div class="credential-row">
                  <span class="credential-label">Identifiant (email)</span>
                  <span class="credential-value">${data.email || ''}</span>
                </div>
                <div class="credential-row">
                  <span class="credential-label">Mot de passe temporaire</span>
                  <span class="credential-value">${data.tempPassword || ''}</span>
                </div>
              </div>
              
              <div class="warning-box">
                <p>⚠️ <strong>Sécurité obligatoire :</strong> Pour protéger votre compte, vous devrez choisir un nouveau mot de passe personnel lors de votre première connexion. Ce mot de passe temporaire ne sera valable qu'une seule fois.</p>
              </div>
              
              <div class="text-center">
                <a href="${data.loginUrl || `${BASE_URL}/login`}" class="button">Se connecter à mon espace</a>
              </div>
              
              <div class="divider"></div>
              
              <div class="info-box" style="background: #FFF5FA; border-color: #FBCFE8;">
                <p class="mb-0" style="color: #BE185D; font-size: 13px; margin: 0;">
                  <strong>🛡️ Conseil de sécurité :</strong> Ne partagez jamais vos identifiants. FINOM ne vous demandera jamais votre mot de passe par email ou téléphone.
                </p>
              </div>
              
              <p class="text-small text-center">Si vous n'êtes pas à l'origine de cette demande, veuillez contacter immédiatement notre service client au +33 1 83 75 35 20.</p>
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),

    // ============= PASSWORD RESET =============
    passwordReset: () => ({
      subject: "🔑 Réinitialisation de votre mot de passe FINOM",
      html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>FINOM</h1>
              <p class="header-subtitle">Sécurité du compte</p>
            </div>
            <div class="content">
              <div class="icon-circle icon-warning">🔑</div>
              <h2 class="text-center">Réinitialisation de mot de passe</h2>
              <p>Bonjour ${data.firstName || ''},</p>
              <p>Vous avez demandé la réinitialisation de votre mot de passe FINOM. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe sécurisé.</p>
              
              <div class="text-center">
                <a href="${data.resetLink || `${BASE_URL}/reset-password`}" class="button">Réinitialiser mon mot de passe</a>
              </div>
              
              <div class="warning-box">
                <p>⏱️ <strong>Lien temporaire :</strong> Pour votre sécurité, ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.</p>
              </div>
              
              <div class="divider"></div>
              
              <p class="text-small">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
              <p style="font-size: 12px; word-break: break-all; color: #64748B; background: #F8FAFC; padding: 12px; border-radius: 8px; font-family: monospace;">${data.resetLink || `${BASE_URL}/reset-password`}</p>
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),

    // ============= LOAN SUBMITTED =============
    loanSubmitted: () => ({
      subject: "✅ Demande de prêt reçue – Référence #${(data.loanId || '').slice(0, 8).toUpperCase()}",
      html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>FINOM</h1>
              <p class="header-subtitle">Demande de crédit</p>
            </div>
            <div class="content">
              <div class="icon-circle icon-info">📋</div>
              <h2 class="text-center">Demande enregistrée</h2>
              <p>Bonjour ${data.firstName || ''},</p>
              <p>Nous avons bien reçu votre demande de prêt immobilier. Votre dossier est maintenant entre les mains de nos experts qui l'analyseront dans les plus brefs délais.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">📎 Référence du dossier</span>
                  <span class="value" style="font-family: monospace;">#${(data.loanId || '').slice(0, 8).toUpperCase()}</span>
                </div>
                <div class="info-row">
                  <span class="label">💰 Montant demandé</span>
                  <span class="value">${formatAmount(data.amount || 0)}</span>
                </div>
                <div class="info-row">
                  <span class="label">📅 Durée du prêt</span>
                  <span class="value">${data.duration || 0} mois (${Math.round((data.duration || 0) / 12)} ans)</span>
                </div>
                <div class="info-row">
                  <span class="label">💳 Mensualité estimée</span>
                  <span class="value highlight">${formatAmount(data.monthlyPayment || 0)}</span>
                </div>
                <div class="info-row">
                  <span class="label">📊 Statut</span>
                  <span class="status-badge status-pending">En cours d'analyse</span>
                </div>
              </div>
              
              <div class="success-box">
                <p>📞 <strong>Prochaine étape :</strong> Un conseiller FINOM vous contactera sous 24h ouvrées pour compléter votre dossier et répondre à vos questions.</p>
              </div>
              
              <div class="text-center">
                <a href="${BASE_URL}/loans" class="button">Suivre mon dossier</a>
              </div>
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),

    // ============= LOAN APPROVED =============
    loanApproved: () => ({
      subject: "🎉 Excellente nouvelle ! Votre prêt est approuvé",
      html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header" style="background: linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%);">
              <h1>FINOM</h1>
              <p class="header-subtitle">Crédit approuvé</p>
            </div>
            <div class="content">
              <div class="icon-circle icon-success">🎉</div>
              <h2 class="text-center">Félicitations ${data.firstName || ''} !</h2>
              <p class="text-center" style="font-size: 17px;">Nous avons le plaisir de vous annoncer que votre demande de prêt immobilier a été <strong class="highlight">approuvée</strong> par notre comité de crédit.</p>
              
              <div class="info-box" style="background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border-color: #6EE7B7;">
                <div class="info-row">
                  <span class="label">📎 Référence</span>
                  <span class="value" style="font-family: monospace;">#${(data.loanId || '').slice(0, 8).toUpperCase()}</span>
                </div>
                <div class="info-row">
                  <span class="label">💰 Montant accordé</span>
                  <span class="value" style="font-size: 18px; color: #059669;">${formatAmount(data.amount || 0)}</span>
                </div>
                <div class="info-row">
                  <span class="label">📈 Taux d'intérêt</span>
                  <span class="value">${data.rate || 0}% TAEG</span>
                </div>
                <div class="info-row">
                  <span class="label">💳 Mensualité</span>
                  <span class="value">${formatAmount(data.monthlyPayment || 0)}/mois</span>
                </div>
                <div class="info-row">
                  <span class="label">✅ Statut</span>
                  <span class="status-badge status-approved">Approuvé</span>
                </div>
              </div>
              
              <h3>Prochaines étapes</h3>
              <div class="steps-list">
                <div class="step-item">
                  <div class="step-number" style="background: linear-gradient(135deg, #059669 0%, #10B981 100%);">1</div>
                  <div class="step-content">
                    <strong>Réception de l'offre de prêt</strong>
                    <span>Vous recevrez votre offre officielle sous 48h</span>
                  </div>
                </div>
                <div class="step-item">
                  <div class="step-number" style="background: linear-gradient(135deg, #059669 0%, #10B981 100%);">2</div>
                  <div class="step-content">
                    <strong>Délai de réflexion légal</strong>
                    <span>10 jours minimum avant signature</span>
                  </div>
                </div>
                <div class="step-item">
                  <div class="step-number" style="background: linear-gradient(135deg, #059669 0%, #10B981 100%);">3</div>
                  <div class="step-content">
                    <strong>Déblocage des fonds</strong>
                    <span>Après signature chez le notaire</span>
                  </div>
                </div>
              </div>
              
              <div class="text-center">
                <a href="${BASE_URL}/loans" class="button" style="background: linear-gradient(135deg, #059669 0%, #10B981 100%);">Consulter mon dossier</a>
              </div>
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),

    // ============= LOAN OFFER ISSUED =============
    loanOfferIssued: () => ({
      subject: "📨 Votre offre de prêt FINOM est disponible",
      html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header" style="background: linear-gradient(135deg, #EA580C 0%, #F97316 50%, #FB923C 100%);">
              <h1>FINOM</h1>
              <p class="header-subtitle">Offre de prêt</p>
            </div>
            <div class="content">
              <div class="icon-circle" style="background: linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%);">📨</div>
              <h2 class="text-center">Offre de prêt émise</h2>
              <p>Bonjour ${data.firstName || ''},</p>
              <p>Suite à l'analyse favorable de votre dossier, nous avons le plaisir de vous transmettre votre <strong>offre de prêt officielle</strong>.</p>
              
              <div class="info-box" style="background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%); border-color: #FDBA74;">
                <div class="info-row">
                  <span class="label">📎 Référence</span>
                  <span class="value" style="font-family: monospace;">#${(data.loanId || '').slice(0, 8).toUpperCase()}</span>
                </div>
                <div class="info-row">
                  <span class="label">💰 Montant du prêt</span>
                  <span class="value">${formatAmount(data.amount || 0)}</span>
                </div>
                <div class="info-row">
                  <span class="label">📈 Taux</span>
                  <span class="value">${data.rate || 0}% TAEG</span>
                </div>
                <div class="info-row">
                  <span class="label">💳 Mensualité</span>
                  <span class="value">${formatAmount(data.monthlyPayment || 0)}/mois</span>
                </div>
                <div class="info-row">
                  <span class="label">📊 Statut</span>
                  <span class="status-badge status-offer">Offre émise</span>
                </div>
              </div>
              
              <div class="warning-box" style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);">
                <p style="margin-bottom: 10px;"><strong>⚖️ Information réglementaire importante</strong></p>
                <p>Conformément à l'article L. 313-34 du Code de la consommation, vous disposez d'un <strong>délai légal de réflexion de ${data.reflectionPeriod || 10} jours</strong> avant de pouvoir accepter cette offre.</p>
                <p class="mb-0" style="margin-top: 10px;">Ce délai commence à courir à compter de la réception de ce document. L'acceptation ne peut intervenir avant le 11ème jour.</p>
              </div>
              
              <div class="text-center">
                <a href="${BASE_URL}/loans" class="button" style="background: linear-gradient(135deg, #EA580C 0%, #F97316 100%);">Consulter mon offre</a>
              </div>
              
              <p class="text-small text-center">Notre équipe reste à votre entière disposition pour toute question concernant votre offre.</p>
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),

    // ============= LOAN REJECTED =============
    loanRejected: () => ({
      subject: "Information concernant votre demande de prêt",
      html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>FINOM</h1>
              <p class="header-subtitle">Suivi de dossier</p>
            </div>
            <div class="content">
              <h2>Bonjour ${data.firstName || ''},</h2>
              <p>Nous vous remercions de la confiance que vous nous avez accordée en soumettant votre demande de financement auprès de FINOM.</p>
              <p>Après une étude approfondie de votre dossier par notre comité de crédit, nous ne sommes malheureusement pas en mesure de donner une suite favorable à votre demande dans les conditions actuelles.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">📎 Référence du dossier</span>
                  <span class="value" style="font-family: monospace;">#${(data.loanId || '').slice(0, 8).toUpperCase()}</span>
                </div>
                <div class="info-row">
                  <span class="label">📊 Décision</span>
                  <span class="status-badge status-rejected">Non retenu</span>
                </div>
                ${data.reason ? `
                <div class="info-row">
                  <span class="label">📝 Motif principal</span>
                  <span class="value">${data.reason}</span>
                </div>
                ` : ''}
              </div>
              
              <div class="info-box" style="background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); border-color: #93C5FD;">
                <p class="mt-0" style="color: #1E40AF; margin-bottom: 10px;"><strong>💡 À noter</strong></p>
                <p style="color: #1E40AF; margin-bottom: 0;">Cette décision ne préjuge en rien de l'évolution future de votre situation. Votre situation peut évoluer et nous vous invitons à nous recontacter ultérieurement si vos conditions changent.</p>
              </div>
              
              <div class="text-center">
                <a href="${BASE_URL}/contact" class="button">Contacter un conseiller</a>
              </div>
              
              <p class="text-small text-center">Nous vous remercions de votre compréhension et restons à votre disposition.</p>
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),

    // ============= DOCUMENT REQUIRED =============
    documentRequired: () => ({
      subject: "📄 Documents requis pour votre dossier #${(data.loanId || '').slice(0, 8).toUpperCase()}",
      html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>FINOM</h1>
              <p class="header-subtitle">Documents en attente</p>
            </div>
            <div class="content">
              <div class="icon-circle icon-warning">📄</div>
              <h2 class="text-center">Documents requis</h2>
              <p>Bonjour ${data.firstName || ''},</p>
              <p>Pour finaliser l'instruction de votre dossier <strong>#${(data.loanId || '').slice(0, 8).toUpperCase()}</strong>, nous avons besoin des pièces justificatives suivantes :</p>
              
              <div class="document-list">
                ${(data.documents || []).map(doc => `
                  <div class="document-item">
                    <div class="document-icon">📎</div>
                    <span class="document-name">${doc}</span>
                  </div>
                `).join('')}
              </div>
              
              <div class="warning-box">
                <p>⏱️ <strong>Délai recommandé :</strong> Afin de ne pas retarder le traitement de votre dossier, nous vous invitons à déposer ces documents dans les meilleurs délais via votre espace client.</p>
              </div>
              
              <div class="text-center">
                <a href="${BASE_URL}/dashboard" class="button">Déposer mes documents</a>
              </div>
              
              <p class="text-small text-center">Besoin d'aide ? Notre équipe est disponible pour vous accompagner.</p>
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),

    // ============= CALLBACK REMINDER =============
    callbackReminder: () => ({
      subject: "📞 Rappel : Votre conseiller FINOM vous appelle bientôt",
      html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header" style="background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #A78BFA 100%);">
              <h1>FINOM</h1>
              <p class="header-subtitle">Rappel de rendez-vous</p>
            </div>
            <div class="content">
              <div class="icon-circle" style="background: linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%);">📞</div>
              <h2 class="text-center">Rendez-vous téléphonique</h2>
              <p>Bonjour ${data.firstName || ''},</p>
              <p>Nous vous rappelons que votre conseiller dédié va vous contacter prochainement pour faire le point sur votre projet.</p>
              
              <div class="info-box" style="background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%); border-color: #C4B5FD; text-align: center;">
                <p style="color: #6D28D9; margin-bottom: 8px; font-weight: 600;">Votre rendez-vous</p>
                <p style="font-size: 24px; font-weight: 800; color: #5B21B6; margin: 0;">${data.scheduledAt || ''}</p>
                ${data.agentName ? `<p style="color: #7C3AED; margin-top: 12px; margin-bottom: 0;">avec <strong>${data.agentName}</strong></p>` : ''}
              </div>
              
              <div class="success-box" style="background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%); border-color: #C4B5FD;">
                <p style="color: #5B21B6; margin: 0;">✅ <strong>Conseil :</strong> Préparez vos questions et ayez sous la main les documents relatifs à votre projet immobilier.</p>
              </div>
              
              <p class="text-center text-muted">Merci de vous assurer d'être disponible à ce créneau.</p>
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),

    // ============= NOTIFICATION =============
    notification: () => ({
      subject: data.title || "Notification FINOM",
      html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>FINOM</h1>
              <p class="header-subtitle">Notification</p>
            </div>
            <div class="content">
              <div class="icon-circle icon-info">🔔</div>
              <h2 class="text-center">${data.title || 'Notification'}</h2>
              <p>Bonjour ${data.firstName || ''},</p>
              <p>${data.message || ''}</p>
              ${data.ctaText && data.ctaUrl ? `
                <div class="text-center">
                  <a href="${data.ctaUrl.startsWith('http') ? data.ctaUrl : BASE_URL + data.ctaUrl}" class="button">${data.ctaText}</a>
                </div>
              ` : ''}
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),

    // ============= TRANSFER COMPLETED =============
    transferCompleted: () => ({
      subject: "✅ Virement effectué – ${formatAmount(data.amount || 0)}",
      html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header" style="background: linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%);">
              <h1>FINOM</h1>
              <p class="header-subtitle">Confirmation de virement</p>
            </div>
            <div class="content">
              <div class="icon-circle icon-success">✅</div>
              <h2 class="text-center">Virement confirmé</h2>
              <p>Bonjour ${data.firstName || ''},</p>
              <p>Nous vous confirmons que votre virement a été exécuté avec succès.</p>
              
              <div class="info-box" style="background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border-color: #6EE7B7;">
                <div class="info-row">
                  <span class="label">💰 Montant</span>
                  <span class="value" style="font-size: 18px; color: #059669;">${formatAmount(data.amount || 0)}</span>
                </div>
                <div class="info-row">
                  <span class="label">👤 Bénéficiaire</span>
                  <span class="value">${data.beneficiary || ''}</span>
                </div>
                ${data.reference ? `
                <div class="info-row">
                  <span class="label">📎 Référence</span>
                  <span class="value" style="font-family: monospace;">${data.reference}</span>
                </div>
                ` : ''}
                <div class="info-row">
                  <span class="label">✅ Statut</span>
                  <span class="status-badge status-approved">Exécuté</span>
                </div>
              </div>
              
              <div class="text-center">
                <a href="${BASE_URL}/banking" class="button" style="background: linear-gradient(135deg, #059669 0%, #10B981 100%);">Voir mes transactions</a>
              </div>
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),

    // ============= DOCUMENT VALIDATED =============
    documentValidated: () => ({
      subject: "✅ Document validé – ${data.documentName || 'Document'}",
      html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header" style="background: linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%);">
              <h1>FINOM</h1>
              <p class="header-subtitle">Document validé</p>
            </div>
            <div class="content">
              <div class="icon-circle icon-success">✅</div>
              <h2 class="text-center">Document accepté</h2>
              <p>Bonjour ${data.firstName || ''},</p>
              <p>Nous avons le plaisir de vous confirmer que votre document a été <strong>validé</strong> par notre équipe d'analyse.</p>
              
              <div class="info-box" style="background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border-color: #6EE7B7;">
                <div class="info-row">
                  <span class="label">📄 Document</span>
                  <span class="value">${data.documentName || 'Document'}</span>
                </div>
                ${data.loanId ? `
                <div class="info-row">
                  <span class="label">📎 Dossier</span>
                  <span class="value" style="font-family: monospace;">#${(data.loanId || '').slice(0, 8).toUpperCase()}</span>
                </div>
                ` : ''}
                <div class="info-row">
                  <span class="label">✅ Statut</span>
                  <span class="status-badge status-approved">Validé</span>
                </div>
              </div>
              
              <div class="success-box">
                <p>🚀 <strong>Votre dossier progresse !</strong> Nous vous tiendrons informé des prochaines étapes par email et via votre espace client.</p>
              </div>
              
              <div class="text-center">
                <a href="${BASE_URL}/dashboard" class="button" style="background: linear-gradient(135deg, #059669 0%, #10B981 100%);">Voir mon dossier</a>
              </div>
            </div>
            ${legalFooter}
          </div>
        </body>
        </html>
      `,
    }),

    // ============= DOCUMENT REJECTED =============
    documentRejected: () => ({
      subject: "⚠️ Document à corriger – ${data.documentName || 'Document'}",
      html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>FINOM</h1>
              <p class="header-subtitle">Document non conforme</p>
            </div>
            <div class="content">
              <div class="icon-circle icon-warning">⚠️</div>
              <h2 class="text-center">Document à corriger</h2>
              <p>Bonjour ${data.firstName || ''},</p>
              <p>Nous avons analysé le document que vous avez soumis, mais celui-ci ne peut malheureusement pas être accepté en l'état.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">📄 Document concerné</span>
                  <span class="value">${data.documentName || 'Document'}</span>
                </div>
                ${data.loanId ? `
                <div class="info-row">
                  <span class="label">📎 Dossier</span>
                  <span class="value" style="font-family: monospace;">#${(data.loanId || '').slice(0, 8).toUpperCase()}</span>
                </div>
                ` : ''}
                <div class="info-row">
                  <span class="label">📊 Statut</span>
                  <span class="status-badge status-rejected">À corriger</span>
                </div>
              </div>
              
              ${data.rejectionReason ? `
              <div class="warning-box">
                <p style="margin-bottom: 8px;"><strong>📝 Motif du rejet :</strong></p>
                <p class="mb-0">${data.rejectionReason}</p>
              </div>
              ` : ''}
              
              <div class="info-box" style="background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); border-color: #93C5FD;">
                <p class="mt-0 mb-0" style="color: #1E40AF;">💡 <strong>Conseil :</strong> Assurez-vous que le document est complet, lisible et au format demandé (PDF, JPG, PNG). Vérifiez que toutes les informations sont visibles.</p>
              </div>
              
              <div class="text-center">
                <a href="${BASE_URL}/dashboard" class="button">Soumettre un nouveau document</a>
              </div>
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
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { template, to, data }: EmailRequest = await req.json();

    // Validate required fields
    if (!template || !to) {
      throw new Error("Missing required fields: template and to");
    }

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
        from: "FINOM <no-reply@notifications.pret-finom.co>",
        to: [to],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      // Log error without sensitive data
      console.error("Email send failed:", { status: response.status, template });
      throw new Error(result.message || "Failed to send email");
    }

    return new Response(JSON.stringify({ success: true, data: { id: result.id } }), {
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
