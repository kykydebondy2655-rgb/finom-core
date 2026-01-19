import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import aboutTeamImage from '@/assets/about-team.jpg';
import { 
  Lightbulb, 
  BarChart3, 
  Wallet, 
  FileCheck, 
  Home, 
  Building2, 
  Landmark, 
  Globe,
  ShieldCheck,
  FileText,
  Scale,
  UserCheck,
  Lock
} from 'lucide-react';

const About: React.FC = () => {
  return (
    <>
      <Header />
      <div className="about-page-finom">
        {/* Hero Section with Image */}
        <section className="about-hero fade-in">
          <div className="container about-hero-grid">
            <div className="about-hero-content">
              <span className="badge-finom">À PROPOS</span>
              <h1>Votre partenaire pour le crédit immobilier</h1>
              <p className="hero-subtitle">
                FINOM est un établissement bancaire spécialisé dans le financement immobilier. 
                Nous accompagnons et finançons directement les projets de nos clients.
              </p>
            </div>
            <div className="about-hero-image">
              <img src={aboutTeamImage} alt="Équipe FINOM" />
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="about-section fade-in">
          <div className="container">
            <div className="content-card">
              <h2>Notre mission</h2>
              <p>
                Notre mission est d'accompagner nos clients dans le <strong>financement de leur projet immobilier</strong>, 
                en leur proposant des solutions de crédit adaptées, transparentes et sécurisées.
              </p>
              <p>
                FINOM met son expertise bancaire au service des particuliers afin de faciliter l'accès au crédit immobilier, 
                de la simulation initiale jusqu'au déblocage des fonds.
              </p>
              <div className="highlight-box">
                <span className="highlight-icon"><Lightbulb size={24} strokeWidth={1.5} /></span>
                <div>
                  <strong>Notre engagement</strong>
                  <p>Vous offrir un accompagnement personnalisé et des conditions de financement claires, sans frais cachés.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Expertise Grid */}
        <section className="expertise-section">
          <div className="container">
            <h2 className="section-title">Notre expertise bancaire</h2>
            <div className="expertise-grid">
              {[
                { Icon: BarChart3, title: 'Analyse financière', desc: "Évaluation approfondie de votre situation financière et de votre capacité d'emprunt." },
                { Icon: Wallet, title: 'Structuration du crédit', desc: "Montage financier sur mesure : durée, taux, mensualités adaptés à votre profil." },
                { Icon: FileCheck, title: 'Étude de solvabilité', desc: "Analyse rigoureuse pour vous proposer les meilleures conditions de financement." },
                { Icon: Home, title: 'Financement immobilier', desc: "Crédit pour résidence principale, secondaire ou investissement locatif." }
              ].map((item, idx) => (
                <div key={idx} className="expertise-card fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                  <span className="expertise-icon"><item.Icon size={28} strokeWidth={1.5} /></span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="partners-section">
          <div className="container">
            <h2 className="section-title">Cadre réglementaire</h2>
            <div className="partners-grid">
              <div className="partner-card fade-in">
                <span className="partner-icon"><Building2 size={28} strokeWidth={1.5} /></span>
                <h3>Treezor</h3>
                <p>Établissement de paiement agréé par l'ACPR (Banque de France)</p>
              </div>
              <div className="partner-card fade-in" style={{ animationDelay: '100ms' }}>
                <span className="partner-icon"><Landmark size={28} strokeWidth={1.5} /></span>
                <h3>Solaris</h3>
                <p>Établissement de crédit agréé par la BaFin (Allemagne)</p>
              </div>
              <div className="partner-card fade-in" style={{ animationDelay: '200ms' }}>
                <span className="partner-icon"><Globe size={28} strokeWidth={1.5} /></span>
                <h3>Conformité européenne</h3>
                <p>Respect des directives bancaires et du RGPD</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="values-section">
          <div className="container">
            <h2 className="section-title">Nos engagements</h2>
            <div className="values-grid">
              {[
                { Icon: ShieldCheck, title: 'Sécurité', desc: 'Données chiffrées et hébergées sur serveurs sécurisés en Europe.' },
                { Icon: FileText, title: 'Transparence', desc: 'Conditions claires : taux, frais et TAEG communiqués dès la simulation.' },
                { Icon: Scale, title: 'Conformité', desc: 'Respect strict des obligations légales en matière de crédit.' },
                { Icon: UserCheck, title: 'Accompagnement', desc: 'Un conseiller dédié de la simulation au déblocage des fonds.' }
              ].map((item, idx) => (
                <div key={idx} className="value-card fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                  <span className="value-icon"><item.Icon size={24} strokeWidth={1.5} /></span>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section-finom">
          <div className="container">
            <div className="cta-content">
              <h2>Besoin d'un financement ?</h2>
              <p>Nos conseillers bancaires sont à votre disposition pour étudier votre projet.</p>
              <div className="cta-buttons">
                <Link to="/simulator" className="btn-primary-finom">Simuler mon crédit</Link>
                <Link to="/contact" className="btn-secondary-finom">Contacter un conseiller</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Domain Banner */}
        <div className="domain-banner-finom">
          <span className="domain-lock"><Lock size={14} /></span>
          Vous êtes sur <strong>pret-finom.co</strong> — Site officiel FINOM
        </div>
      </div>
      <Footer />
    </>
  );
};

export default About;
