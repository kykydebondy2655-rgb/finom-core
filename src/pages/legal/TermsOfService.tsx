import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

/**
 * Conditions Générales d'Utilisation (CGU)
 * Document obligatoire définissant les règles d'utilisation du service
 */
const TermsOfService: React.FC = () => {
  return (
    <>
      <Header />
      <div className="legal-page">
        <div className="legal-container">
          <h1>Conditions Générales d'Utilisation</h1>
          <p className="last-updated">Dernière mise à jour : 12 janvier 2026</p>

          <section>
            <h2>1. Objet</h2>
            <p>Les présentes Conditions Générales d'Utilisation (CGU) définissent les modalités d'accès et d'utilisation de la plateforme FINOM accessible à l'adresse pret-finom.co (ci-après "la Plateforme").</p>
            <p>L'utilisation de la Plateforme implique l'acceptation pleine et entière des présentes CGU.</p>
          </section>

          <section>
            <h2>2. Présentation du service</h2>
            <p>FINOM est une plateforme de courtage en prêt immobilier permettant aux utilisateurs de :</p>
            <ul>
              <li>Simuler des solutions de financement immobilier</li>
              <li>Déposer des demandes de prêt en ligne</li>
              <li>Transmettre les documents nécessaires à l'instruction du dossier</li>
              <li>Suivre l'avancement de leur demande</li>
              <li>Échanger avec un conseiller dédié</li>
            </ul>
            <p>FINOM agit en qualité d'Intermédiaire en Opérations de Banque et en Services de Paiement (IOBSP), immatriculé à l'ORIAS.</p>
          </section>

          <section>
            <h2>3. Création de compte</h2>
            <p>L'accès aux services de FINOM nécessite la création d'un compte utilisateur. L'utilisateur s'engage à :</p>
            <ul>
              <li>Fournir des informations exactes, complètes et à jour</li>
              <li>Maintenir la confidentialité de ses identifiants de connexion</li>
              <li>Notifier immédiatement FINOM en cas d'utilisation non autorisée de son compte</li>
              <li>Ne pas créer de compte au nom d'une autre personne sans son autorisation</li>
            </ul>
            <p>FINOM se réserve le droit de suspendre ou supprimer tout compte en cas de non-respect des présentes CGU.</p>
          </section>

          <section>
            <h2>4. Utilisation du service</h2>
            <p>L'utilisateur s'engage à utiliser la Plateforme de manière conforme à la loi et aux présentes CGU. Il est notamment interdit de :</p>
            <ul>
              <li>Fournir des informations fausses ou trompeuses</li>
              <li>Utiliser la Plateforme à des fins frauduleuses</li>
              <li>Porter atteinte à la sécurité ou au bon fonctionnement de la Plateforme</li>
              <li>Collecter des données personnelles d'autres utilisateurs</li>
              <li>Reproduire, modifier ou distribuer le contenu de la Plateforme sans autorisation</li>
            </ul>
          </section>

          <section>
            <h2>5. Simulations et offres</h2>
            <p>Les simulations réalisées sur la Plateforme sont fournies à titre indicatif et ne constituent pas une offre de prêt. Elles sont basées sur les informations communiquées par l'utilisateur et les conditions du marché au moment de la simulation.</p>
            <p>Les taux et conditions définitifs sont déterminés par les établissements bancaires partenaires après étude complète du dossier.</p>
          </section>

          <section>
            <h2>6. Documents et données</h2>
            <p>L'utilisateur garantit l'authenticité et l'exactitude des documents et informations transmis via la Plateforme. Toute falsification de document constitue un délit pénal passible de poursuites.</p>
            <p>Les documents transmis sont utilisés exclusivement dans le cadre de l'instruction de la demande de financement.</p>
          </section>

          <section>
            <h2>7. Propriété intellectuelle</h2>
            <p>Tous les éléments de la Plateforme (textes, images, logos, logiciels, bases de données) sont protégés par les droits de propriété intellectuelle et appartiennent à FINOM ou à ses partenaires.</p>
            <p>L'utilisateur dispose d'un droit d'utilisation personnel, non exclusif et non transférable, limité à l'accès aux services proposés.</p>
          </section>

          <section>
            <h2>8. Responsabilité</h2>
            <p><strong>Responsabilité de FINOM :</strong></p>
            <ul>
              <li>FINOM s'engage à mettre en œuvre tous les moyens raisonnables pour assurer l'accès et le bon fonctionnement de la Plateforme</li>
              <li>FINOM ne peut garantir l'obtention d'un financement</li>
              <li>FINOM n'est pas responsable des décisions prises par les établissements bancaires</li>
            </ul>
            <p><strong>Responsabilité de l'utilisateur :</strong></p>
            <ul>
              <li>L'utilisateur est responsable de l'exactitude des informations qu'il fournit</li>
              <li>L'utilisateur est responsable de la conservation de ses identifiants</li>
              <li>L'utilisateur s'engage à respecter ses obligations contractuelles</li>
            </ul>
          </section>

          <section>
            <h2>9. Données personnelles</h2>
            <p>Le traitement des données personnelles est régi par notre <a href="/privacy">Politique de Confidentialité</a>.</p>
          </section>

          <section>
            <h2>10. Modification des CGU</h2>
            <p>FINOM se réserve le droit de modifier les présentes CGU à tout moment. Les modifications entrent en vigueur dès leur publication sur la Plateforme.</p>
            <p>L'utilisation continue de la Plateforme après modification vaut acceptation des nouvelles CGU.</p>
          </section>

          <section>
            <h2>11. Résiliation</h2>
            <p>L'utilisateur peut à tout moment demander la suppression de son compte en contactant le service client.</p>
            <p>FINOM peut suspendre ou résilier l'accès d'un utilisateur en cas de :</p>
            <ul>
              <li>Non-respect des présentes CGU</li>
              <li>Activité suspecte ou frauduleuse</li>
              <li>Fourniture d'informations fausses</li>
            </ul>
          </section>

          <section>
            <h2>12. Litiges et médiation</h2>
            <p>En cas de litige, l'utilisateur peut recourir au médiateur de la consommation :</p>
            <div className="info-block">
              <p><strong>Médiateur de l'ASF</strong></p>
              <p>Association Française des Sociétés Financières</p>
              <p><a href="https://lemediateur.asf-france.com" target="_blank" rel="noopener noreferrer">lemediateur.asf-france.com</a></p>
            </div>
          </section>

          <section>
            <h2>13. Droit applicable</h2>
            <p>Les présentes CGU sont régies par le droit français. Tout litige relève de la compétence exclusive des tribunaux français.</p>
          </section>

          <section>
            <h2>14. Contact</h2>
            <p>Pour toute question relative aux présentes CGU, contactez-nous :</p>
            <div className="info-block">
              <p><strong>Email :</strong> contact@pret-finom.co</p>
              <p><strong>Téléphone :</strong> +31 20 524 9111</p>
            </div>
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

        .legal-container ul {
          color: var(--color-text-secondary);
          line-height: 1.7;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .legal-container li {
          margin-bottom: 0.5rem;
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

export default TermsOfService;
