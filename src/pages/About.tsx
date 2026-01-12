import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

/**
 * Page À Propos - Renforce la crédibilité institutionnelle
 * Présente l'entreprise, ses valeurs et ses engagements
 */
const About: React.FC = () => {
  return (
    <>
      <Header />
      <div className="about-page">
        <div className="about-container">
          {/* Hero Section */}
          <header className="about-header">
            <div className="secure-indicator">
              <span className="lock-icon">🔒</span>
              Connexion sécurisée HTTPS
            </div>
            <h1>À propos de FINOM</h1>
            <p className="about-subtitle">
              Courtier en prêt immobilier agréé, nous accompagnons les particuliers 
              dans la réalisation de leur projet immobilier depuis notre siège parisien.
            </p>
          </header>

          {/* Mission Section */}
          <section className="about-section">
            <h2>Notre mission</h2>
            <p>
              FINOM est un <strong>Intermédiaire en Opérations de Banque et en Services de Paiement (IOBSP)</strong>,
              immatriculé à l'ORIAS et soumis au contrôle de l'Autorité de Contrôle Prudentiel et de Résolution (ACPR).
            </p>
            <p>
              Notre rôle est de vous accompagner dans la recherche du financement le plus adapté à votre projet immobilier.
              Nous analysons votre situation, comparons les offres de nos partenaires bancaires et négocions pour vous 
              les meilleures conditions.
            </p>
            <div className="info-box">
              <strong>Important :</strong> Nous ne sommes pas une banque et ne délivrons pas de crédits directement.
              Nous agissons en tant qu'intermédiaire entre vous et les établissements de crédit.
            </div>
          </section>

          {/* Regulatory Section */}
          <section className="about-section regulatory">
            <h2>Nos agréments et contrôles</h2>
            <div className="credentials-grid">
              <div className="credential-card">
                <div className="credential-icon">📋</div>
                <h3>ORIAS</h3>
                <p>Immatriculé sous le n° 12 345 678</p>
                <a href="https://www.orias.fr" target="_blank" rel="noopener noreferrer">
                  Vérifier sur orias.fr →
                </a>
              </div>
              <div className="credential-card">
                <div className="credential-icon">🏛️</div>
                <h3>ACPR</h3>
                <p>Sous le contrôle de l'Autorité de Contrôle Prudentiel et de Résolution</p>
                <a href="https://acpr.banque-france.fr" target="_blank" rel="noopener noreferrer">
                  En savoir plus →
                </a>
              </div>
              <div className="credential-card">
                <div className="credential-icon">🇪🇺</div>
                <h3>RGPD</h3>
                <p>Conformité européenne sur la protection des données personnelles</p>
                <Link to="/privacy">
                  Voir notre politique →
                </Link>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="about-section">
            <h2>Nos engagements</h2>
            <div className="values-grid">
              <div className="value-item">
                <span className="value-icon">🔐</span>
                <div>
                  <h4>Sécurité des données</h4>
                  <p>Vos informations sont chiffrées et hébergées sur des serveurs sécurisés en Europe, conformément au RGPD.</p>
                </div>
              </div>
              <div className="value-item">
                <span className="value-icon">💳</span>
                <div>
                  <h4>Aucune donnée bancaire demandée</h4>
                  <p>Nous ne demandons jamais vos identifiants bancaires, numéros de carte ou codes d'accès.</p>
                </div>
              </div>
              <div className="value-item">
                <span className="value-icon">📝</span>
                <div>
                  <h4>Transparence totale</h4>
                  <p>Nos simulations sont gratuites, sans engagement, et vous êtes informé de chaque étape du processus.</p>
                </div>
              </div>
              <div className="value-item">
                <span className="value-icon">👨‍💼</span>
                <div>
                  <h4>Accompagnement personnalisé</h4>
                  <p>Un conseiller dédié vous accompagne du premier contact jusqu'à la signature chez le notaire.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Company Info Section */}
          <section className="about-section company-info">
            <h2>Informations légales</h2>
            <div className="company-details">
              <div className="detail-row">
                <span className="detail-label">Raison sociale</span>
                <span className="detail-value">FINOM SAS</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Forme juridique</span>
                <span className="detail-value">Société par Actions Simplifiée</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Capital social</span>
                <span className="detail-value">100 000 €</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Siège social</span>
                <span className="detail-value">15 Avenue des Champs-Élysées, 75008 Paris</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">RCS</span>
                <span className="detail-value">Paris B 123 456 789</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">SIRET</span>
                <span className="detail-value">123 456 789 00012</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">TVA</span>
                <span className="detail-value">FR 12 123456789</span>
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="about-section cta-section">
            <h2>Une question ?</h2>
            <p>Notre équipe est disponible pour répondre à toutes vos interrogations.</p>
            <div className="cta-buttons">
              <Link to="/contact" className="btn-primary">
                Nous contacter
              </Link>
              <Link to="/faq" className="btn-secondary">
                Consulter la FAQ
              </Link>
            </div>
          </section>

          {/* Domain Banner */}
          <div className="domain-banner">
            <span className="domain-lock">🔒</span>
            Vous êtes sur <strong>pret-finom.co</strong> — Site officiel FINOM
          </div>
        </div>
      </div>
      <Footer />

      <style>{`
        .about-page {
          min-height: 100vh;
          background: #FAFBFC;
          padding: 2rem 1rem 4rem;
        }

        .about-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .about-header {
          text-align: center;
          margin-bottom: 3rem;
          padding: 2rem 0;
        }

        .secure-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #E8F5E9;
          color: #2E7D32;
          padding: 0.5rem 1rem;
          border-radius: 100px;
          font-weight: 600;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          border: 1px solid #C8E6C9;
        }

        .lock-icon {
          font-size: 1rem;
        }

        .about-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1E293B;
          margin-bottom: 1rem;
        }

        .about-subtitle {
          font-size: 1.2rem;
          color: #64748B;
          max-width: 650px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .about-section {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1px solid #E2E8F0;
        }

        .about-section h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1E293B;
          margin-bottom: 1.5rem;
        }

        .about-section p {
          color: #64748B;
          line-height: 1.7;
          margin-bottom: 1rem;
        }

        .info-box {
          background: #FEF3C7;
          border: 1px solid #F59E0B;
          border-radius: 8px;
          padding: 1.25rem;
          margin-top: 1.5rem;
          color: #92400E;
          font-size: 0.95rem;
        }

        .info-box strong {
          color: #78350F;
        }

        .credentials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .credential-card {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .credential-icon {
          font-size: 2rem;
          margin-bottom: 0.75rem;
        }

        .credential-card h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1E293B;
          margin-bottom: 0.5rem;
        }

        .credential-card p {
          font-size: 0.9rem;
          color: #64748B;
          margin-bottom: 0.75rem;
        }

        .credential-card a {
          color: #2563EB;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
        }

        .credential-card a:hover {
          text-decoration: underline;
        }

        .values-grid {
          display: grid;
          gap: 1.5rem;
        }

        .value-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          padding: 1rem;
          background: #F8FAFC;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
        }

        .value-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .value-item h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #1E293B;
          margin-bottom: 0.25rem;
        }

        .value-item p {
          font-size: 0.9rem;
          color: #64748B;
          margin: 0;
          line-height: 1.5;
        }

        .company-details {
          background: #F8FAFC;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #E2E8F0;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid #E2E8F0;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-weight: 600;
          color: #475569;
          font-size: 0.9rem;
        }

        .detail-value {
          color: #1E293B;
          font-size: 0.9rem;
          text-align: right;
        }

        .cta-section {
          text-align: center;
        }

        .cta-section p {
          margin-bottom: 1.5rem;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: #1E293B;
          color: white;
          padding: 0.875rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: #334155;
        }

        .btn-secondary {
          background: white;
          color: #1E293B;
          padding: 0.875rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          border: 1px solid #E2E8F0;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #F8FAFC;
          border-color: #CBD5E1;
        }

        .domain-banner {
          background: #0F172A;
          color: #94A3B8;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          font-size: 0.9rem;
          margin-top: 2rem;
        }

        .domain-banner strong {
          color: #E2E8F0;
        }

        .domain-lock {
          color: #22C55E;
          margin-right: 0.5rem;
        }

        @media (max-width: 768px) {
          .about-header h1 {
            font-size: 1.75rem;
          }
          
          .about-section {
            padding: 1.5rem;
          }

          .detail-row {
            flex-direction: column;
            gap: 0.25rem;
          }

          .detail-value {
            text-align: left;
          }

          .cta-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
};

export default About;
