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
              FINOM propose un <strong>service de simulation de prêt immobilier</strong> gratuit et sans engagement.
            </p>
            <p>
              Notre rôle est de vous accompagner dans la recherche du financement le plus adapté à votre projet immobilier.
              Nous analysons votre situation et vous orientons vers les meilleures solutions disponibles.
            </p>
            <div className="info-box">
              <strong>Important :</strong> Nous ne sommes pas une banque et ne délivrons pas de crédits directement.
              Ce service est informatif et d'accompagnement.
            </div>
          </section>

          {/* Regulatory Section */}
          <section className="about-section regulatory">
            <h2>Nos partenaires bancaires</h2>
            <div className="credentials-grid">
              <div className="credential-card">
                <div className="credential-icon">🏦</div>
                <h3>Treezor</h3>
                <p>Établissement de monnaie électronique agréé par l'ACPR (France)</p>
              </div>
              <div className="credential-card">
                <div className="credential-icon">🏛️</div>
                <h3>Solaris</h3>
                <p>Banque agréée par la BaFin (Allemagne)</p>
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
            <h2>Contact</h2>
            <div className="company-details">
              <div className="detail-row">
                <span className="detail-label">Nom</span>
                <span className="detail-value">FINOM</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Téléphone</span>
                <span className="detail-value">+31 20 524 9111</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-value">contact@pret-finom.co</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Site web</span>
                <span className="detail-value">pret-finom.co</span>
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

    </>
  );
};

export default About;
