import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

/**
 * Security & Trust Page - Factual overview of security measures
 * Anti-phishing compliant: clear, institutional, no marketing claims
 */
const SecurityTrust: React.FC = () => {
  return (
    <>
      <Header />
      <div className="legal-page">
        <div className="legal-container">
          <h1>Sécurité & Confiance</h1>
          <p className="last-updated">Dernière mise à jour : 12 janvier 2026</p>

          <section>
            <h2>1. Connexion sécurisée (HTTPS)</h2>
            <p>
              L'ensemble du site <strong>pret-finom.co</strong> est accessible exclusivement via HTTPS. 
              Toutes les communications entre votre navigateur et nos serveurs sont chiffrées 
              à l'aide du protocole TLS 1.3.
            </p>
            <div className="info-block">
              <p><strong>Certificat SSL/TLS :</strong> Émis par une autorité de certification reconnue</p>
              <p><strong>Chiffrement :</strong> AES-256 avec Perfect Forward Secrecy</p>
            </div>
          </section>

          <section>
            <h2>2. HTTP Strict Transport Security (HSTS)</h2>
            <p>
              Notre site implémente la politique HSTS, qui force les navigateurs à utiliser 
              exclusivement des connexions HTTPS. Cela protège contre les attaques de type 
              "man-in-the-middle" et les redirections malveillantes.
            </p>
          </section>

          <section>
            <h2>3. Content Security Policy (CSP)</h2>
            <p>
              Une politique de sécurité du contenu stricte est appliquée pour prévenir les 
              attaques de type Cross-Site Scripting (XSS) et l'injection de contenu malveillant.
            </p>
            <ul>
              <li>Aucun script inline (<code>'unsafe-inline'</code> désactivé)</li>
              <li>Aucune évaluation dynamique (<code>'unsafe-eval'</code> désactivé)</li>
              <li>Sources de contenu strictement définies</li>
            </ul>
          </section>

          <section>
            <h2>4. Protection contre le Clickjacking</h2>
            <p>
              L'en-tête <code>X-Frame-Options: DENY</code> empêche l'intégration de notre site 
              dans des iframes, protégeant ainsi contre les attaques de type clickjacking.
            </p>
          </section>

          <section>
            <h2>5. Infrastructure Cloudflare</h2>
            <p>
              Notre site est hébergé sur l'infrastructure Cloudflare, qui fournit :
            </p>
            <ul>
              <li>Protection DDoS de niveau entreprise</li>
              <li>Pare-feu applicatif web (WAF)</li>
              <li>Réseau de distribution de contenu (CDN) mondial</li>
              <li>Certificats SSL gérés automatiquement</li>
            </ul>
          </section>

          <section>
            <h2>6. Authentification des emails</h2>
            <p>
              Pour protéger nos utilisateurs contre le phishing par email, 
              nous recommandons de vérifier que les emails proviennent bien de notre domaine officiel.
            </p>
            <div className="info-block">
              <p><strong>Domaine officiel :</strong> @pret-finom.co</p>
              <p><strong>Email de contact :</strong> contact@pret-finom.co</p>
            </div>
            <p>
              Nous ne vous demanderons <strong>jamais</strong> vos identifiants bancaires, 
              codes de carte ou mots de passe par email.
            </p>
          </section>

          <section>
            <h2>7. Protection des données (RGPD)</h2>
            <p>
              Nous respectons le Règlement Général sur la Protection des Données (RGPD) :
            </p>
            <ul>
              <li>Collecte minimale de données nécessaires au service</li>
              <li>Chiffrement des données sensibles au repos et en transit</li>
              <li>Droits d'accès, de rectification et de suppression garantis</li>
              <li>Aucune vente de données à des tiers</li>
            </ul>
            <p>
              Pour plus de détails, consultez notre <Link to="/privacy">Politique de Confidentialité</Link>.
            </p>
          </section>

          <section>
            <h2>8. Ce que nous ne faisons jamais</h2>
            <ul>
              <li>Demander vos identifiants de banque en ligne</li>
              <li>Demander vos codes PIN ou numéros de carte complets</li>
              <li>Exiger un paiement pour accéder à la simulation</li>
              <li>Vous contacter via des numéros non officiels</li>
              <li>Envoyer des liens vers des sites autres que pret-finom.co</li>
            </ul>
          </section>

          <section>
            <h2>9. Signaler un problème</h2>
            <p>
              Si vous suspectez une tentative de fraude ou de phishing utilisant notre nom, 
              contactez-nous immédiatement :
            </p>
            <div className="info-block">
              <p><strong>Email :</strong> contact@pret-finom.co</p>
              <p><strong>Téléphone :</strong> +31 20 524 9111</p>
            </div>
          </section>

          <section>
            <h2>10. Vérification du site officiel</h2>
            <p>
              Pour vous assurer que vous êtes sur notre site officiel, vérifiez :
            </p>
            <ul>
              <li>L'URL dans la barre d'adresse : <strong>pret-finom.co</strong></li>
              <li>Le cadenas de sécurité dans votre navigateur</li>
              <li>Le certificat SSL (cliquez sur le cadenas pour vérifier)</li>
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SecurityTrust;
