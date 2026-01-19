import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const TermsOfService: React.FC = () => {
  return (
    <>
      <Header />
      <main className="legal-page">
        <section className="legal-hero">
          <div className="container">
            <span className="hero-badge">CONDITIONS</span>
            <h1>Conditions Générales d'Utilisation</h1>
            <p>Dernière mise à jour : 12 janvier 2026</p>
          </div>
        </section>

        <div className="legal-content">
          <div className="container">
            <section className="legal-section animate-fade-in">
              <h2>1. Objet</h2>
              <p>Les présentes CGU définissent les modalités d'accès et d'utilisation de la plateforme FINOM accessible à l'adresse pret-finom.co.</p>
              <p>L'utilisation de la Plateforme implique l'acceptation pleine et entière des présentes CGU.</p>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>2. Présentation du service</h2>
              <p>FINOM est une plateforme de courtage en prêt immobilier permettant de :</p>
              <ul className="service-list">
                <li>Simuler des solutions de financement immobilier</li>
                <li>Déposer des demandes de prêt en ligne</li>
                <li>Transmettre les documents nécessaires</li>
                <li>Suivre l'avancement de votre demande</li>
                <li>Échanger avec un conseiller dédié</li>
              </ul>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>3. Création de compte</h2>
              <p>L'utilisateur s'engage à :</p>
              <ul className="service-list">
                <li>Fournir des informations exactes et à jour</li>
                <li>Maintenir la confidentialité de ses identifiants</li>
                <li>Notifier immédiatement toute utilisation non autorisée</li>
                <li>Ne pas créer de compte au nom d'une autre personne</li>
              </ul>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>4. Utilisation du service</h2>
              <p>Il est notamment interdit de :</p>
              <ul className="service-list warning">
                <li>Fournir des informations fausses ou trompeuses</li>
                <li>Utiliser la Plateforme à des fins frauduleuses</li>
                <li>Porter atteinte à la sécurité de la Plateforme</li>
                <li>Collecter des données d'autres utilisateurs</li>
              </ul>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>5. Simulations et offres</h2>
              <p>Les simulations sont fournies à titre indicatif et ne constituent pas une offre de prêt. Les taux et conditions définitifs sont déterminés par les établissements bancaires partenaires après étude complète du dossier.</p>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>6. Documents et données</h2>
              <p>L'utilisateur garantit l'authenticité et l'exactitude des documents transmis. Toute falsification de document constitue un délit pénal passible de poursuites.</p>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>7. Responsabilité</h2>
              <div className="responsibility-grid">
                <div className="responsibility-item">
                  <strong>FINOM s'engage à :</strong>
                  <ul>
                    <li>Assurer l'accès et le bon fonctionnement</li>
                    <li>Traiter les demandes avec diligence</li>
                  </ul>
                </div>
                <div className="responsibility-item">
                  <strong>FINOM ne garantit pas :</strong>
                  <ul>
                    <li>L'obtention d'un financement</li>
                    <li>Les décisions des établissements bancaires</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>8. Litiges et médiation</h2>
              <div className="info-card">
                <p><strong>Médiateur de l'ASF</strong></p>
                <p>Association Française des Sociétés Financières</p>
                <p><a href="https://lemediateur.asf-france.com" target="_blank" rel="noopener noreferrer">lemediateur.asf-france.com</a></p>
              </div>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>9. Contact</h2>
              <div className="info-card">
                <p><strong>Email :</strong> contact@pret-finom.co</p>
                <p><strong>Téléphone :</strong> 01 87 68 08 90</p>
              </div>
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
        }

        .info-card p {
          margin-bottom: 0.5rem;
        }

        .service-list {
          list-style: none;
          padding: 0;
          margin: 1rem 0;
        }

        .service-list li {
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          background: #F8FAFC;
          border-radius: 8px;
          margin-bottom: 0.5rem;
          color: #475569;
          position: relative;
        }

        .service-list li::before {
          content: '✓';
          position: absolute;
          left: 1rem;
          color: #10B981;
          font-weight: 700;
        }

        .service-list.warning li::before {
          content: '✕';
          color: #EF4444;
        }

        .responsibility-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .responsibility-item {
          background: #F8FAFC;
          padding: 1.25rem;
          border-radius: 12px;
        }

        .responsibility-item strong {
          display: block;
          margin-bottom: 0.75rem;
          color: #0F172A;
        }

        .responsibility-item ul {
          margin: 0;
          padding-left: 1.25rem;
        }

        .responsibility-item li {
          color: #64748B;
          margin-bottom: 0.5rem;
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
        }
      `}</style>
    </>
  );
};

export default TermsOfService;