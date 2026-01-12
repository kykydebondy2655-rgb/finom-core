import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

/**
 * Mentions Légales - Page obligatoire pour conformité fintech
 * Contient toutes les informations requises par la loi française
 */
const LegalNotice: React.FC = () => {
  return (
    <>
      <Header />
      <div className="legal-page">
        <div className="legal-container">
          <h1>Mentions Légales</h1>
          <p className="last-updated">Dernière mise à jour : 12 janvier 2026</p>

          <section>
            <h2>1. Éditeur du site</h2>
            <div className="info-block">
              <p><strong>Raison sociale :</strong> FINOM Payments B.V.</p>
              <p><strong>Forme juridique :</strong> Besloten Vennootschap (B.V.) — Société à responsabilité limitée néerlandaise</p>
              <p><strong>Siège social :</strong> Jachthavenweg 109H, 1081 KM Amsterdam, Pays-Bas</p>
              <p><strong>Numéro KVK (Chambre de Commerce) :</strong> 78680751</p>
              <p><strong>Code LEI :</strong> 7245008GWLPQCA1S1726</p>
              <p><strong>Téléphone :</strong> +31 20 524 9111</p>
              <p><strong>Email :</strong> contact@pret-finom.co</p>
              <p><strong>Site web :</strong> pret-finom.co</p>
            </div>
          </section>

          <section>
            <h2>2. Statut réglementaire</h2>
            <div className="info-block">
              <p><strong>Agrément :</strong> Établissement de monnaie électronique (Electronic Money Institution)</p>
              <p><strong>Autorité de régulation :</strong> De Nederlandsche Bank (DNB)</p>
              <p><strong>Numéro de relation DNB :</strong> R180074</p>
              <p><strong>Catégorie :</strong> Betaalinstelling, Elektronischgeldinstelling</p>
            </div>
            <p>FINOM Payments B.V. est agréé par De Nederlandsche Bank pour exercer des activités d'établissement de paiement et de monnaie électronique aux Pays-Bas et dans l'Espace Économique Européen.</p>
          </section>

          <section>
            <h2>3. Directeur de la publication</h2>
            <p>Le directeur de la publication est le représentant légal de FINOM Payments B.V.</p>
          </section>

          <section>
            <h2>4. Hébergeur</h2>
            <div className="info-block">
              <p><strong>Nom :</strong> Cloudflare, Inc.</p>
              <p><strong>Adresse :</strong> 101 Townsend St, San Francisco, CA 94107, États-Unis</p>
              <p><strong>Site web :</strong> https://www.cloudflare.com</p>
            </div>
          </section>

          <section>
            <h2>5. Partenaires bancaires</h2>
            <p>FINOM travaille en partenariat avec des établissements financiers agréés :</p>
            <ul className="partner-list">
              <li><strong>Treezor</strong> — Établissement de monnaie électronique agréé par l'ACPR (France)</li>
              <li><strong>Solaris</strong> — Banque agréée par la BaFin (Allemagne)</li>
            </ul>
            <p>Ces partenaires sont régulés et conformes aux réglementations européennes.</p>
          </section>

          <section>
            <h2>6. Propriété intellectuelle</h2>
            <p>L'ensemble du contenu de ce site (textes, images, logos, graphismes, vidéos, structure, mise en page) est la propriété exclusive de FINOM Payments B.V. ou de ses partenaires.</p>
            <p>Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de FINOM Payments B.V.</p>
          </section>

          <section>
            <h2>7. Protection des données personnelles</h2>
            <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez de droits sur vos données personnelles.</p>
            <p>Pour plus d'informations, consultez notre <a href="/privacy">Politique de Confidentialité</a>.</p>
            <p><strong>Contact :</strong> contact@pret-finom.co</p>
          </section>

          <section>
            <h2>8. Cookies</h2>
            <p>Ce site utilise des cookies pour améliorer votre expérience de navigation. Pour en savoir plus sur notre utilisation des cookies, consultez notre <a href="/privacy">Politique de Confidentialité</a>.</p>
          </section>

          <section>
            <h2>9. Médiation</h2>
            <p>En cas de litige, vous pouvez contacter notre service client à contact@pret-finom.co pour rechercher une solution amiable.</p>
          </section>

          <section>
            <h2>10. Droit applicable</h2>
            <p>Les présentes mentions légales sont soumises au droit néerlandais, conformément au siège social de FINOM Payments B.V. Pour les consommateurs résidant en France, les dispositions impératives du droit français de la consommation demeurent applicables.</p>
          </section>
        </div>
      </div>
      <Footer />

      <style>{`
        .legal-page {
          min-height: 100vh;
          background: var(--color-surface);
          padding: 2rem 1rem 4rem;
        }

        .legal-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: var(--radius-lg);
          padding: 3rem;
          box-shadow: var(--shadow-sm);
        }

        .legal-container h1 {
          font-size: 2rem;
          font-weight: 800;
          color: var(--color-text);
          margin-bottom: 0.5rem;
        }

        .last-updated {
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--color-border);
        }

        .legal-container section {
          margin-bottom: 2rem;
        }

        .legal-container h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text);
          margin-bottom: 1rem;
        }

        .legal-container p {
          color: var(--color-text-secondary);
          line-height: 1.7;
          margin-bottom: 0.75rem;
        }

        .legal-container a {
          color: var(--color-primary);
          text-decoration: underline;
        }

        .legal-container a:hover {
          color: var(--color-primary-dark);
        }

        .info-block {
          background: var(--color-surface);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          margin: 1rem 0;
        }

        .info-block p {
          margin-bottom: 0.5rem;
        }

        .info-block p:last-child {
          margin-bottom: 0;
        }

        @media (max-width: 768px) {
          .legal-container {
            padding: 1.5rem;
          }
          
          .legal-container h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default LegalNotice;
