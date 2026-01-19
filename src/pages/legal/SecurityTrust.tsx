import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Shield, Lock, Server, Mail, AlertTriangle, CheckCircle } from 'lucide-react';

const SecurityTrust: React.FC = () => {
  const securityFeatures = [
    {
      icon: <Lock size={24} />,
      title: 'Connexion sécurisée (HTTPS)',
      description: 'Toutes les communications sont chiffrées avec TLS 1.3 et AES-256.'
    },
    {
      icon: <Shield size={24} />,
      title: 'HTTP Strict Transport Security',
      description: 'HSTS force les connexions HTTPS exclusives, protégeant contre les attaques man-in-the-middle.'
    },
    {
      icon: <Server size={24} />,
      title: 'Content Security Policy',
      description: 'CSP stricte pour prévenir les attaques XSS et l\'injection de contenu malveillant.'
    },
    {
      icon: <Shield size={24} />,
      title: 'Protection Clickjacking',
      description: 'X-Frame-Options: DENY empêche l\'intégration dans des iframes malveillantes.'
    }
  ];

  const cloudflareFeatures = [
    'Protection DDoS de niveau entreprise',
    'Pare-feu applicatif web (WAF)',
    'Réseau de distribution mondial (CDN)',
    'Certificats SSL gérés automatiquement'
  ];

  const neverDoList = [
    'Demander vos identifiants de banque en ligne',
    'Demander vos codes PIN ou numéros de carte',
    'Exiger un paiement pour accéder à la simulation',
    'Vous contacter via des numéros non officiels',
    'Envoyer des liens vers des sites autres que pret-finom.co'
  ];

  return (
    <>
      <Header />
      <main className="security-page">
        <section className="security-hero">
          <div className="container">
            <span className="hero-badge">SÉCURITÉ</span>
            <div className="hero-icon-wrapper">
              <Shield size={48} />
            </div>
            <h1>Sécurité & Confiance</h1>
            <p>Votre sécurité est notre priorité absolue</p>
          </div>
        </section>

        <div className="security-content">
          <div className="container">
            {/* Security Features */}
            <div className="security-grid">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="security-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="security-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Cloudflare Section */}
            <div className="cloudflare-section animate-fade-in">
              <div className="section-icon">
                <Server size={32} />
              </div>
              <h2>Infrastructure Cloudflare</h2>
              <p>Notre site est hébergé sur l'infrastructure Cloudflare, qui fournit :</p>
              <ul className="cloudflare-list">
                {cloudflareFeatures.map((feature, index) => (
                  <li key={index}>
                    <CheckCircle size={18} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Email Authentication */}
            <div className="email-section animate-fade-in">
              <div className="section-icon">
                <Mail size={32} />
              </div>
              <h2>Authentification des emails</h2>
              <div className="info-card">
                <p><strong>Domaine officiel :</strong> @pret-finom.co</p>
                <p><strong>Email de contact :</strong> contact@pret-finom.co</p>
              </div>
              <p className="warning-text">
                Nous ne vous demanderons <strong>jamais</strong> vos identifiants bancaires, codes de carte ou mots de passe par email.
              </p>
            </div>

            {/* GDPR Section */}
            <div className="gdpr-section animate-fade-in">
              <h2>🛡️ Protection des données (RGPD)</h2>
              <div className="gdpr-grid">
                <div className="gdpr-item">
                  <CheckCircle size={20} />
                  <span>Collecte minimale de données</span>
                </div>
                <div className="gdpr-item">
                  <CheckCircle size={20} />
                  <span>Chiffrement des données sensibles</span>
                </div>
                <div className="gdpr-item">
                  <CheckCircle size={20} />
                  <span>Droits d'accès et suppression garantis</span>
                </div>
                <div className="gdpr-item">
                  <CheckCircle size={20} />
                  <span>Aucune vente de données à des tiers</span>
                </div>
              </div>
              <p>
                Pour plus de détails, consultez notre <Link to="/privacy">Politique de Confidentialité</Link>.
              </p>
            </div>

            {/* Never Do Section */}
            <div className="never-section animate-fade-in">
              <div className="section-header">
                <AlertTriangle size={28} />
                <h2>Ce que nous ne faisons jamais</h2>
              </div>
              <ul className="never-list">
                {neverDoList.map((item, index) => (
                  <li key={index}>
                    <span className="never-icon">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Report Section */}
            <div className="report-section animate-fade-in">
              <h2>🚨 Signaler un problème</h2>
              <p>Si vous suspectez une tentative de fraude ou de phishing, contactez-nous immédiatement :</p>
              <div className="contact-card">
                <p><strong>Email :</strong> contact@pret-finom.co</p>
                <p><strong>Téléphone :</strong> 01 87 68 08 90</p>
              </div>
            </div>

            {/* Verification Section */}
            <div className="verify-section animate-fade-in">
              <h2>✅ Vérification du site officiel</h2>
              <div className="verify-grid">
                <div className="verify-item">
                  <span className="verify-number">1</span>
                  <p>Vérifiez l'URL : <strong>pret-finom.co</strong></p>
                </div>
                <div className="verify-item">
                  <span className="verify-number">2</span>
                  <p>Cherchez le cadenas de sécurité</p>
                </div>
                <div className="verify-item">
                  <span className="verify-number">3</span>
                  <p>Cliquez sur le cadenas pour vérifier le certificat</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        .security-page {
          background: #F8FAFC;
          min-height: 100vh;
        }

        .security-hero {
          background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
          padding: 6rem 1.5rem 5rem;
          text-align: center;
          position: relative;
        }

        .security-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 50%);
        }

        .hero-badge {
          display: inline-block;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          padding: 0.5rem 1.25rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          margin-bottom: 1.5rem;
          position: relative;
        }

        .hero-icon-wrapper {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: #10B981;
          position: relative;
        }

        .security-hero h1 {
          color: white;
          font-size: clamp(2rem, 5vw, 2.75rem);
          font-weight: 800;
          margin-bottom: 1rem;
          position: relative;
        }

        .security-hero p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.1rem;
          position: relative;
        }

        .security-content {
          padding: 4rem 1.5rem;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
        }

        .security-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .security-card {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .security-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 1rem;
        }

        .security-card h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #0F172A;
        }

        .security-card p {
          color: #64748B;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .cloudflare-section, .email-section, .gdpr-section, .never-section, .report-section, .verify-section {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .section-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #FE42B4 0%, #D61F8D 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 1rem;
        }

        h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 1rem;
        }

        .cloudflare-list {
          list-style: none;
          padding: 0;
          margin: 1rem 0;
        }

        .cloudflare-list li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 0;
          color: #475569;
        }

        .cloudflare-list li svg {
          color: #10B981;
        }

        .info-card, .contact-card {
          background: #F8FAFC;
          padding: 1.25rem;
          border-radius: 12px;
          margin: 1rem 0;
        }

        .info-card p, .contact-card p {
          margin-bottom: 0.5rem;
          color: #475569;
        }

        .warning-text {
          color: #92400E;
          background: #FEF3C7;
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .gdpr-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .gdpr-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #475569;
        }

        .gdpr-item svg {
          color: #10B981;
        }

        .gdpr-section a {
          color: #FE42B4;
          text-decoration: none;
          font-weight: 500;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          color: #EF4444;
        }

        .section-header h2 {
          margin: 0;
          color: #EF4444;
        }

        .never-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .never-list li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: #FEE2E2;
          border-radius: 8px;
          margin-bottom: 0.5rem;
          color: #991B1B;
        }

        .never-icon {
          font-weight: 700;
        }

        .verify-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .verify-item {
          text-align: center;
        }

        .verify-number {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #FE42B4 0%, #D61F8D 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          margin: 0 auto 0.75rem;
        }

        .verify-item p {
          color: #475569;
          font-size: 0.9rem;
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .security-hero {
            padding: 4rem 1rem 3rem;
          }

          .verify-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default SecurityTrust;