import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const LegalNotice: React.FC = () => {
  return (
    <>
      <Header />
      <main className="legal-page">
        <section className="legal-hero">
          <div className="container">
            <span className="hero-badge">INFORMATIONS LÉGALES</span>
            <h1>Mentions Légales</h1>
            <p>Dernière mise à jour : 12 janvier 2026</p>
          </div>
        </section>

        <div className="legal-content">
          <div className="container">
            <section className="legal-section animate-fade-in">
              <h2>1. Éditeur du site</h2>
              <div className="info-card">
                <p><strong>Raison sociale :</strong> FINOM Payments B.V.</p>
                <p><strong>Forme juridique :</strong> Besloten Vennootschap (B.V.)</p>
                <p><strong>Siège social :</strong> Jachthavenweg 109H, 1081 KM Amsterdam, Pays-Bas</p>
                <p><strong>Établissement secondaire :</strong> 9 Rue du Quatre Septembre, 75002 Paris, France</p>
                <p><strong>Numéro KVK :</strong> 78680751</p>
                <p><strong>Téléphone :</strong> 01 87 68 08 90</p>
                <p><strong>Email :</strong> contact@pret-finom.co</p>
              </div>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>2. Statut réglementaire</h2>
              <div className="info-card">
                <p><strong>Agrément :</strong> Établissement de monnaie électronique</p>
                <p><strong>Autorité de régulation :</strong> De Nederlandsche Bank (DNB)</p>
                <p><strong>Numéro de relation DNB :</strong> R180074</p>
              </div>
              <p>FINOM Payments B.V. est agréé par De Nederlandsche Bank pour exercer des activités d'établissement de paiement et de monnaie électronique.</p>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>3. Directeur de la publication</h2>
              <p>Le directeur de la publication est le représentant légal de FINOM Payments B.V.</p>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>4. Partenaires bancaires</h2>
              <p>FINOM travaille en partenariat avec des établissements financiers agréés :</p>
              <ul className="partner-list">
                <li><strong>Treezor</strong> — Établissement de monnaie électronique agréé par l'ACPR</li>
                <li><strong>Solaris</strong> — Banque agréée par la BaFin</li>
              </ul>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>5. Propriété intellectuelle</h2>
              <p>L'ensemble du contenu de ce site est la propriété exclusive de FINOM Payments B.V. ou de ses partenaires. Toute reproduction est interdite sauf autorisation écrite préalable.</p>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>6. Protection des données personnelles</h2>
              <p>Conformément au RGPD, vous disposez de droits sur vos données personnelles.</p>
              <p>Pour plus d'informations, consultez notre <a href="/privacy">Politique de Confidentialité</a>.</p>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>7. Cookies</h2>
              <p>Ce site utilise des cookies pour améliorer votre expérience. Pour en savoir plus, consultez notre <a href="/privacy">Politique de Confidentialité</a>.</p>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>8. Médiation</h2>
              <p>En cas de litige, contactez notre service client à contact@pret-finom.co pour rechercher une solution amiable.</p>
            </section>

            <section className="legal-section animate-fade-in">
              <h2>9. Droit applicable</h2>
              <p>Les présentes mentions légales sont soumises au droit néerlandais. Pour les consommateurs résidant en France, les dispositions impératives du droit français demeurent applicables.</p>
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

        .partner-list {
          list-style: none;
          padding: 0;
          margin: 1rem 0;
        }

        .partner-list li {
          padding: 0.75rem 1rem;
          background: #F8FAFC;
          border-radius: 8px;
          margin-bottom: 0.5rem;
          color: #475569;
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

export default LegalNotice;