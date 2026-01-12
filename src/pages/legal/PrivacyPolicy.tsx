import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

/**
 * Politique de Confidentialité - Conformité RGPD
 * Document obligatoire pour tout site collectant des données personnelles
 */
const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Header />
      <div className="legal-page">
        <div className="legal-container">
          <h1>Politique de Confidentialité</h1>
          <p className="last-updated">Dernière mise à jour : 12 janvier 2026</p>

          <section>
            <h2>1. Responsable du traitement</h2>
            <div className="info-block">
              <p><strong>FINOM Payments B.V.</strong></p>
              <p>Jachthavenweg 109H, 1081 KM Amsterdam, Pays-Bas</p>
              <p>KVK : 78680751</p>
              <p>Email : contact@pret-finom.co</p>
              <p>Téléphone : +31 20 524 9111</p>
            </div>
          </section>

          <section>
            <h2>2. Données collectées</h2>
            <p>Dans le cadre de nos services de courtage en prêt immobilier, nous collectons :</p>
            <ul>
              <li><strong>Données d'identification :</strong> nom, prénom, date de naissance, adresse postale</li>
              <li><strong>Coordonnées :</strong> email, numéro de téléphone</li>
              <li><strong>Données financières :</strong> revenus, charges, patrimoine, situation bancaire</li>
              <li><strong>Données professionnelles :</strong> employeur, fonction, ancienneté</li>
              <li><strong>Documents justificatifs :</strong> pièce d'identité, justificatifs de revenus, relevés bancaires</li>
              <li><strong>Données de connexion :</strong> adresse IP, logs de connexion, données de navigation</li>
            </ul>
          </section>

          <section>
            <h2>3. Finalités du traitement</h2>
            <p>Vos données sont traitées pour :</p>
            <ul>
              <li>Étudier votre demande de financement</li>
              <li>Vous mettre en relation avec nos partenaires bancaires</li>
              <li>Gérer votre compte utilisateur</li>
              <li>Vous contacter concernant votre dossier</li>
              <li>Respecter nos obligations légales et réglementaires</li>
              <li>Améliorer nos services et notre plateforme</li>
              <li>Prévenir la fraude et les risques</li>
            </ul>
          </section>

          <section>
            <h2>4. Base légale du traitement</h2>
            <ul>
              <li><strong>Exécution du contrat :</strong> traitement de votre demande de prêt</li>
              <li><strong>Obligation légale :</strong> lutte anti-blanchiment, obligations réglementaires</li>
              <li><strong>Intérêt légitime :</strong> amélioration des services, sécurité</li>
              <li><strong>Consentement :</strong> communications marketing (opt-in)</li>
            </ul>
          </section>

          <section>
            <h2>5. Destinataires des données</h2>
            <p>Vos données peuvent être transmises à :</p>
            <ul>
              <li>Nos établissements bancaires partenaires</li>
              <li>Nos sous-traitants techniques (hébergement, CRM)</li>
              <li>Les autorités compétentes sur demande légale</li>
              <li>Les assureurs partenaires</li>
            </ul>
            <p>Aucune donnée n'est vendue ou cédée à des tiers à des fins commerciales.</p>
          </section>

          <section>
            <h2>6. Durée de conservation</h2>
            <ul>
              <li><strong>Données clients actifs :</strong> durée de la relation + 5 ans</li>
              <li><strong>Dossiers de prêt :</strong> 10 ans après la fin du contrat</li>
              <li><strong>Données de prospection :</strong> 3 ans après le dernier contact</li>
              <li><strong>Cookies :</strong> 13 mois maximum</li>
              <li><strong>Logs de connexion :</strong> 1 an</li>
            </ul>
          </section>

          <section>
            <h2>7. Vos droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul>
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
              <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
              <li><strong>Droit à la limitation :</strong> restreindre le traitement</li>
              <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format standard</li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement</li>
              <li><strong>Droit de retirer votre consentement :</strong> à tout moment</li>
            </ul>
            <p>Pour exercer vos droits, contactez-nous à : <a href="mailto:contact@pret-finom.co">contact@pret-finom.co</a></p>
          </section>

          <section>
            <h2>8. Sécurité des données</h2>
            <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées :</p>
            <ul>
              <li>Chiffrement SSL/TLS des transmissions</li>
              <li>Chiffrement des données sensibles au repos</li>
              <li>Contrôle d'accès strict aux données</li>
              <li>Audits de sécurité réguliers</li>
              <li>Formation du personnel à la protection des données</li>
              <li>Procédures de gestion des incidents</li>
            </ul>
          </section>

          <section>
            <h2>9. Cookies</h2>
            <p>Nous utilisons les cookies suivants :</p>
            <ul>
              <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site</li>
              <li><strong>Cookies de performance :</strong> analyse d'audience (avec consentement)</li>
              <li><strong>Cookies de fonctionnalité :</strong> mémorisation de vos préférences</li>
            </ul>
            <p>Vous pouvez gérer vos préférences de cookies à tout moment dans les paramètres de votre navigateur.</p>
          </section>

          <section>
            <h2>10. Transferts hors UE</h2>
            <p>Certaines données peuvent être traitées par des sous-traitants situés hors de l'Union Européenne. Dans ce cas, nous nous assurons que des garanties appropriées sont en place (clauses contractuelles types, certification Privacy Shield le cas échéant).</p>
          </section>

          <section>
            <h2>11. Réclamation</h2>
            <p>Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de l'autorité de protection des données compétente :</p>
            <div className="info-block">
              <p><strong>Autoriteit Persoonsgegevens (Pays-Bas)</strong></p>
              <p>Bezuidenhoutseweg 30, 2594 AV Den Haag</p>
              <p><a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">autoriteitpersoonsgegevens.nl</a></p>
            </div>
            <p className="note">Pour les utilisateurs français, vous pouvez également contacter la CNIL : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a></p>
          </section>

          <section>
            <h2>12. Modifications</h2>
            <p>Nous nous réservons le droit de modifier cette politique de confidentialité. Toute modification sera publiée sur cette page avec une date de mise à jour. En cas de modification substantielle, nous vous en informerons par email.</p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
