import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  motion, 
  fadeInUp, 
  scaleIn,
  staggerContainer
} from '@/components/animations';
import { useScroll, useTransform } from 'framer-motion';
import { 
  BarChart3, 
  Percent, 
  UserCheck, 
  ShieldCheck, 
  Globe, 
  BadgeCheck, 
  Building2, 
  Lock 
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import heroImage from '@/assets/hero-mortgage.png';

// Custom stagger variant for Home page
const staggerHome = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const Home = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  // Parallax transforms
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.6]);

  return (
    <>
      <Header />
      <div className="home-page">
        {/* Hero Section */}
        <section className="hero" ref={heroRef}>
          <div className="container hero-container">
            <motion.div 
              className="hero-content"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div 
                className="secure-badge"
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
              >
                <Lock size={14} className="lock-icon" />
                Connexion sécurisée HTTPS
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
              >
                Votre crédit immobilier <br />
                avec <span className="highlight">FINOM</span>
              </motion.h1>
              <motion.p 
                className="hero-subtitle"
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
              >
                FINOM vous accompagne et finance votre projet immobilier.
                Simulation gratuite, réponse rapide, conditions transparentes.
              </motion.p>
              <motion.div 
                className="cta-group"
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
              >
                <Link to="/simulator">
                  <motion.button 
                    className="btn-accent btn-pill cta-button-large"
                    whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(254, 66, 180, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    Simuler mon crédit immobilier
                  </motion.button>
                </Link>
                <Link to="/how-it-works" className="btn-secondary-link">
                  Comment ça marche ? →
                </Link>
              </motion.div>
              <motion.div 
                className="trust-markers"
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
              >
                <span className="trust-item">🏦 Établissement bancaire</span>
                <span className="trust-item">🇪🇺 Conforme RGPD</span>
                <span className="trust-item">📋 Conditions claires</span>
              </motion.div>
              <motion.p 
                className="no-data-warning"
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
              >
                Simulation gratuite et sans engagement. Aucun frais pour l'étude de votre dossier.
              </motion.p>
            </motion.div>
            <motion.div 
              className="hero-image"
              style={{ 
                y: imageY, 
                scale: imageScale,
                opacity: imageOpacity 
              }}
            >
              <img src={heroImage} alt="Financement immobilier FINOM" />
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="how-it-works" className="section-features">
          <div className="container">
            <motion.h2 
              className="text-center section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5 }}
            >
              Pourquoi financer avec FINOM ?
            </motion.h2>
            <motion.div 
              className="bento-grid"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-50px' }}
              variants={staggerContainer}
            >
              <motion.div 
                className="card card-feature feature-card"
                variants={scaleIn}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}
              >
                <motion.div 
                  className="icon-box"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <BarChart3 size={32} strokeWidth={1.5} />
                </motion.div>
                <h3>Crédit sur mesure</h3>
                <p>Nous analysons votre situation financière et vous proposons un financement adapté à votre capacité d'emprunt.</p>
              </motion.div>
              <motion.div 
                className="card card-feature feature-card"
                variants={scaleIn}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}
              >
                <motion.div 
                  className="icon-box"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Percent size={32} strokeWidth={1.5} />
                </motion.div>
                <h3>Taux compétitifs</h3>
                <p>Bénéficiez de conditions de financement attractives avec un TAEG transparent dès la simulation.</p>
              </motion.div>
              <motion.div 
                className="card card-feature feature-card"
                variants={scaleIn}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}
              >
                <motion.div 
                  className="icon-box"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <UserCheck size={32} strokeWidth={1.5} />
                </motion.div>
                <h3>Conseiller dédié</h3>
                <p>Un expert bancaire vous accompagne de l'étude de votre dossier jusqu'au déblocage des fonds.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Security Reassurance Section */}
        <section className="section-security">
          <div className="container">
            <motion.div 
              className="security-content"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5 }}
            >
              <h2>Un établissement bancaire fiable</h2>
              <motion.div 
                className="security-grid"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: '-50px' }}
                variants={staggerContainer}
              >
                {[
                  { Icon: ShieldCheck, title: 'Sécurité bancaire', desc: 'Toutes vos données transitent via une connexion chiffrée SSL/TLS.' },
                  { Icon: Globe, title: 'Conformité européenne', desc: 'Respect des directives bancaires européennes et du RGPD.' },
                  { Icon: BadgeCheck, title: 'Partenaires agréés', desc: 'Nous travaillons avec Treezor (ACPR) et Solaris (BaFin).' },
                  { Icon: Building2, title: 'Financement direct', desc: 'FINOM délivre directement votre crédit immobilier, sans intermédiaire.' },
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="security-item"
                    variants={fadeInUp}
                    transition={{ duration: 0.4 }}
                    whileHover={{ 
                      y: -4, 
                      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)',
                      transition: { duration: 0.2 }
                    }}
                  >
                    <motion.span 
                      className="security-icon"
                      whileHover={{ scale: 1.2 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <item.Icon size={24} strokeWidth={1.5} />
                    </motion.span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Domain Display */}
        <section className="section-domain">
          <div className="container">
            <motion.p 
              className="domain-display"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Lock size={14} className="domain-lock" />
              Vous êtes sur <strong>pret-finom.co</strong> — Site officiel FINOM
            </motion.p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Home;
