import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Header />
      <main className="legal-page">
        <section className="legal-hero">
          <div className="container">
            <span className="hero-badge">RGPD</span>
            <h1>Politique de Confidentialité</h1>
            <p>Dernière mise à jour : 12 janvier 2026</p>
          </div>
        </section>

        <div className="legal-content">
          <div className="container">
            <section className="legal-section animate-fade-in">
              <h2>1. Responsable du traitement</h2>
              <div className="info-card">
                <p><strong>FINOM Payments B.V.</strong></p>
                <p>Jachthavenweg 109H, 1081 KM Amsterdam, Pays-Bas</p>
                <p>Email : contact@pret-finom.co</p>
              </div>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>2. Données collectées</h2>
              <ul className="data-list">
                <li><strong>Identification :</strong> nom, prénom, date de naissance, adresse</li>
                <li><strong>Coordonnées :</strong> email, téléphone</li>
                <li><strong>Financières :</strong> revenus, charges, patrimoine</li>
                <li><strong>Professionnelles :</strong> employeur, fonction, ancienneté</li>
                <li><strong>Documents :</strong> pièce d'identité, justificatifs de revenus</li>
                <li><strong>Connexion :</strong> adresse IP, logs, navigation</li>
              </ul>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>3. Finalités du traitement</h2>
              <ul className="data-list">
                <li>Étudier votre demande de financement</li>
                <li>Vous mettre en relation avec nos partenaires bancaires</li>
                <li>Gérer votre compte utilisateur</li>
                <li>Respecter nos obligations légales et réglementaires</li>
                <li>Améliorer nos services</li>
              </ul>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>4. Base légale du traitement</h2>
              <ul className="data-list">
                <li><strong>Exécution du contrat :</strong> traitement de votre demande</li>
                <li><strong>Obligation légale :</strong> lutte anti-blanchiment</li>
                <li><strong>Intérêt légitime :</strong> amélioration des services</li>
                <li><strong>Consentement :</strong> communications marketing</li>
              </ul>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>5. Durée de conservation</h2>
              <ul className="data-list">
                <li><strong>Données clients :</strong> durée de la relation + 5 ans</li>
                <li><strong>Dossiers de prêt :</strong> 10 ans après fin du contrat</li>
                <li><strong>Données de prospection :</strong> 3 ans après dernier contact</li>
                <li><strong>Cookies :</strong> 13 mois maximum</li>
              </ul>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>6. Vos droits</h2>
              <div className="rights-grid">
                <div className="right-item">
                  <span className="right-icon">👁️</span>
                  <strong>Accès</strong>
                  <p>Obtenir une copie de vos données</p>
                </div>
                <div className="right-item">
                  <span className="right-icon">✏️</span>
                  <strong>Rectification</strong>
                  <p>Corriger vos données inexactes</p>
                </div>
                <div className="right-item">
                  <span className="right-icon">🗑️</span>
                  <strong>Effacement</strong>
                  <p>Supprimer vos données</p>
                </div>
                <div className="right-item">
                  <span className="right-icon">📦</span>
                  <strong>Portabilité</strong>
                  <p>Récupérer vos données</p>
                </div>
              </div>
              <p>Contactez-nous à : <a href="mailto:contact@pret-finom.co">contact@pret-finom.co</a></p>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>7. Sécurité des données</h2>
              <ul className="data-list">
                <li>Chiffrement SSL/TLS des transmissions</li>
                <li>Chiffrement des données sensibles au repos</li>
                <li>Contrôle d'accès strict aux données</li>
                <li>Audits de sécurité réguliers</li>
              </ul>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>8. Réclamation</h2>
              <p>Vous pouvez introduire une réclamation auprès de :</p>
              <div className="info-card">
                <p><strong>Autoriteit Persoonsgegevens (Pays-Bas)</strong></p>
                <p><a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">autoriteitpersoonsgegevens.nl</a></p>
              </div>
              <p>Pour les utilisateurs français : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a></p>
            </section>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        .legal-page {
          background: #F8FAFC;
          min-height: 100vh;
        }

        .legal-hero {
          background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
          padding: 6rem 1.5rem 4rem;
          text-align: center;
          position: relative;
        }

        .legal-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 20%, rgba(254, 66, 180, 0.15) 0%, transparent 50%);
        }

        .hero-badge {
          display: inline-block;
          background: linear-gradient(135deg, #FE42B4 0%, #D61F8D 100%);
          color: white;
          padding: 0.5rem 1.25rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          margin-bottom: 1.5rem;
          position: relative;
        }

        .legal-hero h1 {
          color: white;
          font-size: clamp(2rem, 5vw, 2.5rem);
          font-weight: 800;
          margin-bottom: 1rem;
          position: relative;
        }

        .legal-hero p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.95rem;
          position: relative;
        }

        .legal-content {
          padding: 4rem 1.5rem;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
        }

        .legal-section {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .legal-section h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #FE42B4;
        }

        .legal-section p {
          color: #475569;
          line-height: 1.7;
          margin-bottom: 0.75rem;
        }

        .legal-section a {
          color: #FE42B4;
          text-decoration: none;
          font-weight: 500;
        }

        .legal-section a:hover {
          text-decoration: underline;
        }

        .info-card {
          background: #F8FAFC;
          padding: 1.25rem;
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .info-card p {
          margin-bottom: 0.5rem;
        }

        .data-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .data-list li {
          padding: 0.75rem 0;
          border-bottom: 1px solid #E2E8F0;
          color: #475569;
        }

        .data-list li:last-child {
          border-bottom: none;
        }

        .rights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .right-item {
          background: #F8FAFC;
          padding: 1.25rem;
          border-radius: 12px;
          text-align: center;
        }

        .right-icon {
          font-size: 1.5rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .right-item strong {
          display: block;
          margin-bottom: 0.25rem;
          color: #0F172A;
        }

        .right-item p {
          font-size: 0.85rem;
          color: #64748B;
          margin: 0;
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .legal-hero {
            padding: 4rem 1rem 3rem;
          }

          .legal-section {
            padding: 1.5rem;
          }

          .rights-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </>
  );
};

export default PrivacyPolicy;