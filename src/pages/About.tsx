import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

/**
 * Page À Propos - Positionnement bancaire clair
 * FINOM est une banque qui délivre des crédits immobiliers
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
            <h1>Votre banque pour le crédit immobilier</h1>
            <p className="about-subtitle">
              FINOM est un établissement bancaire spécialisé dans le financement immobilier. 
              Nous accompagnons et finançons directement les projets immobiliers de nos clients.
            </p>
          </header>

          {/* Mission Section */}
          <section className="about-section">
            <h2>Notre mission</h2>
            <p>
              Notre mission est d'accompagner nos clients dans le <strong>financement de leur projet immobilier</strong>, 
              en leur proposant des solutions de crédit adaptées, transparentes et sécurisées.
            </p>
            <p>
              FINOM met son expertise bancaire au service des particuliers afin de faciliter l'accès au crédit immobilier, 
              de la simulation initiale jusqu'au déblocage des fonds.
            </p>
            <div className="info-box">
              <strong>Notre engagement :</strong> Vous offrir un accompagnement personnalisé et des conditions 
              de financement claires, sans frais cachés ni mauvaise surprise.
            </div>
          </section>

          {/* Expertise Section */}
          <section className="about-section">
            <h2>Notre expertise bancaire</h2>
            <div className="values-grid">
              <div className="value-item">
                <span className="value-icon">📊</span>
                <div>
                  <h4>Analyse financière</h4>
                  <p>Évaluation approfondie de votre situation financière et de votre capacité d'emprunt selon les critères bancaires en vigueur.</p>
                </div>
              </div>
              <div className="value-item">
                <span className="value-icon">💰</span>
                <div>
                  <h4>Structuration du crédit</h4>
                  <p>Montage financier sur mesure : durée, taux, mensualités et garanties adaptés à votre profil et à votre projet.</p>
                </div>
              </div>
              <div className="value-item">
                <span className="value-icon">📋</span>
                <div>
                  <h4>Étude de solvabilité</h4>
                  <p>Analyse rigoureuse de votre dossier pour vous proposer les meilleures conditions de financement possibles.</p>
                </div>
              </div>
              <div className="value-item">
                <span className="value-icon">🏠</span>
                <div>
                  <h4>Financement immobilier</h4>
                  <p>Crédit immobilier pour l'achat de résidence principale, secondaire ou investissement locatif.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Regulatory Section */}
          <section className="about-section regulatory">
            <h2>Cadre réglementaire et partenaires</h2>
            <div className="credentials-grid">
              <div className="credential-card">
                <div className="credential-icon">🏦</div>
                <h3>Treezor</h3>
                <p>Établissement de paiement agréé par l'ACPR (Banque de France)</p>
              </div>
              <div className="credential-card">
                <div className="credential-icon">🏛️</div>
                <h3>Solaris</h3>
                <p>Établissement de crédit agréé par la BaFin (Allemagne)</p>
              </div>
              <div className="credential-card">
                <div className="credential-icon">🇪🇺</div>
                <h3>Conformité européenne</h3>
                <p>Respect des directives bancaires européennes et du RGPD</p>
                <Link to="/privacy">
                  Politique de confidentialité →
                </Link>
              </div>
            </div>
          </section>

          {/* Engagements Section */}
          <section className="about-section">
            <h2>Nos engagements</h2>
            <div className="values-grid">
              <div className="value-item">
                <span className="value-icon">🔐</span>
                <div>
                  <h4>Sécurité des données</h4>
                  <p>Vos informations sont chiffrées et hébergées sur des serveurs sécurisés en Europe, conformément aux standards bancaires.</p>
                </div>
              </div>
              <div className="value-item">
                <span className="value-icon">📝</span>
                <div>
                  <h4>Transparence totale</h4>
                  <p>Conditions de crédit claires : taux, frais de dossier, coût total du crédit et TAEG communiqués dès la simulation.</p>
                </div>
              </div>
              <div className="value-item">
                <span className="value-icon">⚖️</span>
                <div>
                  <h4>Conformité réglementaire</h4>
                  <p>Respect strict des obligations légales en matière de crédit immobilier et de protection du consommateur.</p>
                </div>
              </div>
              <div className="value-item">
                <span className="value-icon">👨‍💼</span>
                <div>
                  <h4>Accompagnement personnalisé</h4>
                  <p>Un conseiller dédié vous accompagne de la simulation jusqu'au déblocage des fonds chez le notaire.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Company Info Section */}
          <section className="about-section company-info">
            <h2>Contact</h2>
            <div className="company-details">
              <div className="detail-row">
                <span className="detail-label">Établissement</span>
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
            <h2>Besoin d'un financement ?</h2>
            <p>Nos conseillers bancaires sont à votre disposition pour étudier votre projet.</p>
            <div className="cta-buttons">
              <Link to="/simulator" className="btn-primary">
                Simuler mon crédit
              </Link>
              <Link to="/contact" className="btn-secondary">
                Contacter un conseiller
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
