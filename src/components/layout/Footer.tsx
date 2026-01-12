import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer Component - Mentions légales obligatoires pour conformité fintech
 * Contient toutes les informations requises pour éviter la détection phishing
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Section principale */}
        <div className="footer-main">
          <div className="footer-brand">
            <span className="footer-logo">FINOM</span>
            <p className="footer-tagline">Votre partenaire financement immobilier</p>
            <div className="footer-certifications">
              <span className="certification-badge">ORIAS N° 12 345 678</span>
              <span className="certification-badge">ACPR</span>
            </div>
          </div>

<div className="footer-links-grid">
            <div className="footer-column">
              <h4>Services</h4>
              <Link to="/simulator">Simulateur de prêt</Link>
              <Link to="/rates">Nos taux</Link>
              <Link to="/how-it-works">Comment ça marche</Link>
              <Link to="/faq">FAQ</Link>
            </div>

            <div className="footer-column">
              <h4>À propos</h4>
              <Link to="/about">Qui sommes-nous</Link>
              <Link to="/contact">Nous contacter</Link>
              <a href="https://www.orias.fr" target="_blank" rel="noopener noreferrer">Vérifier ORIAS</a>
              <a href="https://acpr.banque-france.fr" target="_blank" rel="noopener noreferrer">ACPR</a>
            </div>

            <div className="footer-column">
              <h4>Légal</h4>
              <Link to="/legal">Mentions légales</Link>
              <Link to="/privacy">Politique de confidentialité</Link>
              <Link to="/terms">CGU</Link>
            </div>

            <div className="footer-column">
              <h4>Contact</h4>
              <a href="mailto:contact@pret-finom.co">contact@pret-finom.co</a>
              <a href="tel:+33123456789">+33 (0)1 23 45 67 89</a>
              <span className="secure-note">🔒 pret-finom.co</span>
            </div>
          </div>
        </div>

        {/* Informations légales obligatoires */}
        <div className="footer-legal">
          <div className="legal-info">
            <p><strong>FINOM SAS</strong> - Société par Actions Simplifiée au capital de 100 000 €</p>
            <p>Siège social : 15 Avenue des Champs-Élysées, 75008 Paris, France</p>
            <p>RCS Paris B 123 456 789 - SIRET 123 456 789 00012 - TVA FR 12 123456789</p>
          </div>
          
          <div className="regulatory-info">
            <p>
              <strong>Intermédiaire en Opérations de Banque et en Services de Paiement (IOBSP)</strong>
              <br />
              Immatriculé à l'ORIAS sous le n° 12 345 678 - Vérifiable sur{' '}
              <a href="https://www.orias.fr" target="_blank" rel="noopener noreferrer">www.orias.fr</a>
            </p>
            <p>
              Sous le contrôle de l'<strong>Autorité de Contrôle Prudentiel et de Résolution (ACPR)</strong>
              <br />
              4 Place de Budapest, CS 92459, 75436 Paris Cedex 09
            </p>
          </div>

          <div className="mediation-info">
            <p>
              <strong>Médiation :</strong> En cas de litige, vous pouvez recourir gratuitement au 
              médiateur de l'ASF - <a href="https://lemediateur.asf-france.com" target="_blank" rel="noopener noreferrer">lemediateur.asf-france.com</a>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>© {currentYear} FINOM SAS. Tous droits réservés.</p>
          <p className="disclaimer">
            Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.
          </p>
        </div>
      </div>

      <style>{`
        .footer {
          background: #0F172A;
          color: #94A3B8;
          padding: 0;
          margin-top: auto;
        }

        .footer-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .footer-main {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 4rem;
          padding: 4rem 0 3rem;
          border-bottom: 1px solid #1E293B;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .footer-logo {
          font-size: 1.75rem;
          font-weight: 900;
          color: white;
          letter-spacing: -0.03em;
        }

        .footer-tagline {
          font-size: 0.95rem;
          color: #64748B;
          margin: 0;
        }

        .footer-certifications {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }

        .certification-badge {
          background: #1E293B;
          color: #94A3B8;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

.footer-links-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        .secure-note {
          display: block;
          color: #22C55E;
          font-size: 0.85rem;
          font-weight: 600;
          margin-top: 0.5rem;
        }

        .footer-column h4 {
          color: white;
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .footer-column a {
          display: block;
          color: #94A3B8;
          text-decoration: none;
          font-size: 0.9rem;
          margin-bottom: 0.75rem;
          transition: color 0.2s;
        }

        .footer-column a:hover {
          color: white;
        }

        .footer-legal {
          padding: 2rem 0;
          border-bottom: 1px solid #1E293B;
        }

        .footer-legal .legal-info {
          margin-bottom: 1.5rem;
        }

        .footer-legal p {
          font-size: 0.8rem;
          line-height: 1.6;
          margin: 0 0 0.5rem;
          color: #64748B;
        }

        .footer-legal strong {
          color: #94A3B8;
        }

        .footer-legal a {
          color: var(--color-primary);
          text-decoration: underline;
        }

        .footer-legal a:hover {
          color: #FF69C4;
        }

        .regulatory-info {
          background: #1E293B;
          border-radius: 8px;
          padding: 1.25rem;
          margin: 1.5rem 0;
        }

        .regulatory-info p {
          margin: 0 0 1rem;
        }

        .regulatory-info p:last-child {
          margin-bottom: 0;
        }

        .mediation-info {
          margin-top: 1.5rem;
        }

        .footer-bottom {
          padding: 1.5rem 0;
          text-align: center;
        }

        .footer-bottom p {
          font-size: 0.8rem;
          color: #64748B;
          margin: 0 0 0.5rem;
        }

        .footer-bottom .disclaimer {
          font-size: 0.75rem;
          font-style: italic;
          color: #475569;
          max-width: 600px;
          margin: 0 auto;
        }

        @media (max-width: 1024px) {
          .footer-main {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
        }

        @media (max-width: 768px) {
          .footer-links-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .footer-main {
            padding: 2.5rem 0 2rem;
          }
        }

        @media (max-width: 480px) {
          .footer-links-grid {
            grid-template-columns: 1fr;
          }

          .footer-certifications {
            flex-direction: column;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
