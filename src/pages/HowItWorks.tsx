import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/finom/Button';
import processImage from '@/assets/process-digital.jpg';
import { 
    motion,
    fadeInUp,
    scaleIn,
    staggerContainer
} from '@/components/animations';
import { 
    Calculator, 
    FileText, 
    Upload, 
    Search, 
    CheckCircle2, 
    Zap, 
    ShieldCheck, 
    UserCheck, 
    BadgeEuro, 
    Smartphone, 
    Target,
    Clock
} from 'lucide-react';

const HowItWorks = () => {
    const navigate = useNavigate();

    const steps = [
        {
            number: 1,
            Icon: Calculator,
            title: 'Simulation en ligne',
            duration: '5 minutes',
            description: "Estimez votre capacité d'emprunt et vos mensualités gratuitement.",
            details: [
                'Renseignez le montant souhaité et la durée',
                'Indiquez vos revenus et charges',
                'Obtenez instantanément une estimation'
            ]
        },
        {
            number: 2,
            Icon: FileText,
            title: 'Constitution du dossier',
            duration: '30-45 minutes',
            description: 'Créez votre compte et complétez votre demande de crédit en ligne.',
            details: [
                'Remplissez le formulaire de demande guidé',
                'Renseignez votre situation personnelle',
                'Sauvegardez et reprenez quand vous voulez'
            ]
        },
        {
            number: 3,
            Icon: Upload,
            title: 'Upload des documents',
            duration: '15-20 minutes',
            description: 'Transmettez vos justificatifs de manière sécurisée.',
            details: [
                "Uploadez vos pièces d'identité",
                "Ajoutez vos bulletins de salaire",
                'Suivez la validation en temps réel'
            ]
        },
        {
            number: 4,
            Icon: Search,
            title: 'Analyse et étude',
            duration: '5-7 jours ouvrés',
            description: 'Nos experts analysent votre dossier.',
            details: [
                'Vérification de la complétude',
                'Analyse de votre situation financière',
                'Communication régulière sur l\'avancement'
            ]
        },
        {
            number: 5,
            Icon: CheckCircle2,
            title: 'Décision et offre',
            duration: '2-3 jours ouvrés',
            description: "Recevez votre décision et votre offre de prêt personnalisée.",
            details: [
                'Notification de la décision',
                "Édition de l'offre de prêt",
                'Signature électronique'
            ]
        }
    ];

    const advantages = [
        { Icon: Zap, title: 'Rapidité', desc: 'Réponse sous 7 jours ouvrés' },
        { Icon: ShieldCheck, title: 'Sécurité', desc: 'Données chiffrées' },
        { Icon: UserCheck, title: 'Accompagnement', desc: 'Un conseiller dédié' },
        { Icon: BadgeEuro, title: 'Transparence', desc: 'Aucun frais caché' },
        { Icon: Smartphone, title: '100% en ligne', desc: 'Gérez où vous voulez' },
        { Icon: Target, title: 'Sur-mesure', desc: 'Solutions adaptées' }
    ];

    return (
        <>
            <Header />
            <div className="how-page-finom">
                {/* Hero with Image */}
                <section className="how-hero fade-in">
                    <div className="container how-hero-grid">
                        <div className="how-hero-content">
                            <span className="badge-finom">PROCESSUS</span>
                            <h1>Comment ça marche ?</h1>
                            <p className="hero-subtitle">
                                Obtenez votre crédit immobilier en 5 étapes simples.
                                Un parcours 100% en ligne, transparent et sécurisé.
                            </p>
                        </div>
                        <div className="how-hero-image">
                            <img src={processImage} alt="Processus digital FINOM" />
                        </div>
                    </div>
                </section>

                {/* Timeline */}
                <section className="timeline-section">
                    <div className="container">
                        <div className="timeline-finom">
                            {steps.map((step, idx) => (
                                <div 
                                    key={idx} 
                                    className="timeline-step fade-in" 
                                    style={{ animationDelay: `${idx * 150}ms` }}
                                >
                                    <div className="step-number-finom">{step.number}</div>
                                    <div className="step-content-finom">
                                        <div className="step-header-finom">
                                            <span className="step-icon-finom">
                                                <step.Icon size={28} strokeWidth={1.5} />
                                            </span>
                                            <div>
                                                <h3>{step.title}</h3>
                                                <span className="step-duration">
                                                    <Clock size={14} className="inline-icon" />
                                                    {step.duration}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="step-description">{step.description}</p>
                                        <ul className="step-details-finom">
                                            {step.details.map((detail, dIdx) => (
                                                <li key={dIdx}>{detail}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="advantages-section-finom">
                    <div className="container">
                        <motion.h2 
                            className="section-title"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-100px' }}
                            transition={{ duration: 0.5 }}
                        >
                            Les avantages FINOM
                        </motion.h2>
                        <motion.div 
                            className="advantages-grid-finom"
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true, margin: '-50px' }}
                            variants={staggerContainer}
                        >
                            {advantages.map((adv, idx) => (
                                <motion.div 
                                    key={idx} 
                                    className="advantage-card-finom"
                                    variants={scaleIn}
                                    transition={{ duration: 0.4 }}
                                    whileHover={{ 
                                        y: -8, 
                                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                                        transition: { duration: 0.2 }
                                    }}
                                >
                                    <motion.span 
                                        className="advantage-icon-finom"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <adv.Icon size={32} strokeWidth={1.5} />
                                    </motion.span>
                                    <h4>{adv.title}</h4>
                                    <p>{adv.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* CTA */}
                <section className="cta-section-finom">
                    <div className="container">
                        <div className="cta-content">
                            <h2>Prêt à démarrer votre projet ?</h2>
                            <p>Commencez par une simulation gratuite et sans engagement.</p>
                            <div className="cta-buttons">
                                <Button onClick={() => navigate('/simulator')} variant="primary" size="lg">
                                    Faire une simulation
                                </Button>
                                <Button onClick={() => navigate('/contact')} variant="secondary" size="lg">
                                    Poser une question
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
};

export default HowItWorks;
