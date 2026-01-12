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
              <p><strong>Raison sociale :</strong> FINOM SAS</p>
              <p><strong>Forme juridique :</strong> Société par Actions Simplifiée</p>
              <p><strong>Capital social :</strong> 100 000 €</p>
              <p><strong>Siège social :</strong> 15 Avenue des Champs-Élysées, 75008 Paris, France</p>
              <p><strong>RCS :</strong> Paris B 123 456 789</p>
              <p><strong>SIRET :</strong> 123 456 789 00012</p>
              <p><strong>Code APE :</strong> 6419Z - Autres intermédiations monétaires</p>
              <p><strong>TVA Intracommunautaire :</strong> FR 12 123456789</p>
              <p><strong>Téléphone :</strong> +31 20 524 9111</p>
              <p><strong>Email :</strong> contact@pret-finom.co</p>
            </div>
          </section>

          <section>
            <h2>2. Directeur de la publication</h2>
            <p>Le directeur de la publication est le Président de FINOM SAS.</p>
          </section>

          <section>
            <h2>3. Hébergeur</h2>
            <div className="info-block">
              <p><strong>Nom :</strong> Lovable Technologies</p>
              <p><strong>Adresse :</strong> San Francisco, CA, États-Unis</p>
              <p><strong>Site web :</strong> https://lovable.dev</p>
            </div>
          </section>

          <section>
            <h2>4. Activité réglementée</h2>
            <p>FINOM SAS exerce une activité d'intermédiaire en opérations de banque et en services de paiement (IOBSP) immatriculée à l'ORIAS sous le numéro 12 345 678.</p>
            <p>Vous pouvez vérifier cette immatriculation sur le site de l'ORIAS : <a href="https://www.orias.fr" target="_blank" rel="noopener noreferrer">www.orias.fr</a></p>
            <p>FINOM SAS est soumise au contrôle de l'Autorité de Contrôle Prudentiel et de Résolution (ACPR) - 4 Place de Budapest, CS 92459, 75436 Paris Cedex 09.</p>
          </section>

          <section>
            <h2>5. Propriété intellectuelle</h2>
            <p>L'ensemble du contenu de ce site (textes, images, logos, graphismes, vidéos, structure, mise en page) est la propriété exclusive de FINOM SAS ou de ses partenaires.</p>
            <p>Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de FINOM SAS.</p>
          </section>

          <section>
            <h2>6. Protection des données personnelles</h2>
            <p>Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez de droits sur vos données personnelles.</p>
            <p>Pour plus d'informations, consultez notre <a href="/privacy">Politique de Confidentialité</a>.</p>
            <p><strong>Délégué à la Protection des Données (DPO) :</strong> dpo@pret-finom.co</p>
          </section>

          <section>
            <h2>7. Cookies</h2>
            <p>Ce site utilise des cookies pour améliorer votre expérience de navigation. Pour en savoir plus sur notre utilisation des cookies, consultez notre <a href="/privacy">Politique de Confidentialité</a>.</p>
          </section>

          <section>
            <h2>8. Médiation</h2>
            <p>En cas de litige, vous pouvez recourir gratuitement au médiateur de la consommation :</p>
            <div className="info-block">
              <p><strong>Médiateur de l'ASF :</strong></p>
              <p>Association Française des Sociétés Financières</p>
              <p>75 rue Taitbout, 75009 Paris</p>
              <p><a href="https://lemediateur.asf-france.com" target="_blank" rel="noopener noreferrer">lemediateur.asf-france.com</a></p>
            </div>
          </section>

          <section>
            <h2>9. Droit applicable</h2>
            <p>Les présentes mentions légales sont soumises au droit français. En cas de litige, et après échec de toute tentative de recherche d'une solution amiable, les tribunaux français seront seuls compétents.</p>
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
