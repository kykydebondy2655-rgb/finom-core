import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import aboutTeamImage from '@/assets/about-team.jpg';
import { 
  motion,
  fadeInUp,
  scaleIn,
  staggerContainer
} from '@/components/animations';
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
        <motion.section 
          className="about-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container about-hero-grid">
            <motion.div 
              className="about-hero-content"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.span className="badge-finom" variants={fadeInUp}>À PROPOS</motion.span>
              <motion.h1 variants={fadeInUp}>Votre partenaire pour le crédit immobilier</motion.h1>
              <motion.p className="hero-subtitle" variants={fadeInUp}>
                FINOM est un établissement bancaire spécialisé dans le financement immobilier. 
                Nous accompagnons et finançons directement les projets de nos clients.
              </motion.p>
            </motion.div>
            <motion.div 
              className="about-hero-image"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img src={aboutTeamImage} alt="Équipe FINOM" />
            </motion.div>
          </div>
        </motion.section>

        {/* Mission Section */}
        <motion.section 
          className="about-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
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
        </motion.section>

        {/* Expertise Grid */}
        <section className="expertise-section">
          <div className="container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5 }}
            >
              Notre expertise bancaire
            </motion.h2>
            <motion.div 
              className="expertise-grid"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-50px' }}
              variants={staggerContainer}
            >
              {[
                { Icon: BarChart3, title: 'Analyse financière', desc: "Évaluation approfondie de votre situation financière et de votre capacité d'emprunt." },
                { Icon: Wallet, title: 'Structuration du crédit', desc: "Montage financier sur mesure : durée, taux, mensualités adaptés à votre profil." },
                { Icon: FileCheck, title: 'Étude de solvabilité', desc: "Analyse rigoureuse pour vous proposer les meilleures conditions de financement." },
                { Icon: Home, title: 'Financement immobilier', desc: "Crédit pour résidence principale, secondaire ou investissement locatif." }
              ].map((item, idx) => (
                <motion.div 
                  key={idx} 
                  className="expertise-card"
                  variants={scaleIn}
                  transition={{ duration: 0.4 }}
                  whileHover={{ 
                    y: -8, 
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.span 
                    className="expertise-icon"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <item.Icon size={28} strokeWidth={1.5} />
                  </motion.span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="partners-section">
          <div className="container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5 }}
            >
              Cadre réglementaire
            </motion.h2>
            <motion.div 
              className="partners-grid"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-50px' }}
              variants={staggerContainer}
            >
              {[
                { Icon: Building2, title: 'Treezor', desc: "Établissement de paiement agréé par l'ACPR (Banque de France)" },
                { Icon: Landmark, title: 'Solaris', desc: "Établissement de crédit agréé par la BaFin (Allemagne)" },
                { Icon: Globe, title: 'Conformité européenne', desc: "Respect des directives bancaires et du RGPD" }
              ].map((item, idx) => (
                <motion.div 
                  key={idx} 
                  className="partner-card"
                  variants={scaleIn}
                  transition={{ duration: 0.4 }}
                  whileHover={{ 
                    y: -8, 
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.span 
                    className="partner-icon"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <item.Icon size={28} strokeWidth={1.5} />
                  </motion.span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="values-section">
          <div className="container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5 }}
            >
              Nos engagements
            </motion.h2>
            <motion.div 
              className="values-grid"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-50px' }}
              variants={staggerContainer}
            >
              {[
                { Icon: ShieldCheck, title: 'Sécurité', desc: 'Données chiffrées et hébergées sur serveurs sécurisés en Europe.' },
                { Icon: FileText, title: 'Transparence', desc: 'Conditions claires : taux, frais et TAEG communiqués dès la simulation.' },
                { Icon: Scale, title: 'Conformité', desc: 'Respect strict des obligations légales en matière de crédit.' },
                { Icon: UserCheck, title: 'Accompagnement', desc: 'Un conseiller dédié de la simulation au déblocage des fonds.' }
              ].map((item, idx) => (
                <motion.div 
                  key={idx} 
                  className="value-card"
                  variants={scaleIn}
                  transition={{ duration: 0.4 }}
                  whileHover={{ 
                    y: -8, 
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.span 
                    className="value-icon"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <item.Icon size={24} strokeWidth={1.5} />
                  </motion.span>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <motion.section 
          className="cta-section-finom"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
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
        </motion.section>

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
