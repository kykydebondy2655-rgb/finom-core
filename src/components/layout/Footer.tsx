import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <span className="footer-logo">FINOM</span>
            <p className="footer-tagline">Votre banque pour le crédit immobilier</p>
            <div className="footer-certifications">
              <span className="certification-badge">Partenaire Treezor</span>
              <span className="certification-badge">Partenaire Solaris</span>
            </div>
          </div>

          <div className="footer-links-grid">
            <div className="footer-column">
              <h4>Crédit immobilier</h4>
              <Link to="/simulator">Simuler mon crédit</Link>
              <Link to="/rates">Nos taux</Link>
              <Link to="/how-it-works">Comment ça marche</Link>
              <Link to="/faq">Questions fréquentes</Link>
            </div>

            <div className="footer-column">
              <h4>Notre établissement</h4>
              <Link to="/about">À propos de FINOM</Link>
              <Link to="/contact">Contacter un conseiller</Link>
            </div>

            <div className="footer-column">
              <h4>Informations légales</h4>
              <Link to="/legal">Mentions légales</Link>
              <Link to="/privacy">Politique de confidentialité</Link>
              <Link to="/terms">Conditions générales</Link>
              <Link to="/security">Sécurité</Link>
            </div>

            <div className="footer-column">
              <h4>Contact</h4>
              <a href="mailto:contact@pret-finom.co">contact@pret-finom.co</a>
              <a href="tel:+33187680890">01 87 68 08 90</a>
              <span className="secure-note">🔒 pret-finom.co</span>
            </div>

            <div className="footer-column md:hidden">
              <h4>Application mobile</h4>
              <Link to="/install" className="flex items-center gap-2">
                <Smartphone size={16} />
                Installer l'application
              </Link>
            </div>
          </div>
        </div>

        <div className="footer-legal">
          <div className="legal-info">
            <p><strong>FINOM</strong> — Établissement bancaire spécialisé en crédit immobilier</p>
            <p>Contact : contact@pret-finom.co | 01 87 68 08 90</p>
          </div>
          
          <div className="regulatory-info">
            <p>
              <strong>Partenaires bancaires agréés :</strong> Treezor (ACPR - France) et Solaris (BaFin - Allemagne)
            </p>
            <p>
              Vos données sont protégées et hébergées en Europe, conformément au RGPD et aux standards bancaires.
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
