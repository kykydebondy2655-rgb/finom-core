import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <span className="footer-logo">FINOM</span>
            <p className="footer-tagline">Votre partenaire financement immobilier</p>
            <div className="footer-certifications">
              <span className="certification-badge">Partenaire Treezor</span>
              <span className="certification-badge">Partenaire Solaris</span>
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
              <a href="tel:+31205249111">+31 20 524 9111</a>
              <span className="secure-note">🔒 pret-finom.co</span>
            </div>
          </div>
        </div>

        <div className="footer-legal">
          <div className="legal-info">
            <p><strong>FINOM</strong> — Service de simulation de prêt immobilier</p>
            <p>Contact : contact@pret-finom.co | +31 20 524 9111</p>
          </div>
          
          <div className="regulatory-info">
            <p>
              <strong>Partenaires bancaires agréés :</strong> Treezor (ACPR - France) et Solaris (BaFin - Allemagne)
            </p>
            <p>
              Vos données sont protégées et hébergées en Europe, conformément au RGPD.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} FINOM. Tous droits réservés.</p>
          <p className="disclaimer">
            Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;