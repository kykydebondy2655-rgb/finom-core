import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/finom/Button';
import processImage from '@/assets/process-digital.jpg';

const HowItWorks = () => {
    const navigate = useNavigate();

    const steps = [
        {
            number: 1,
            icon: '🧮',
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
            icon: '📝',
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
            icon: '📄',
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
            icon: '🔍',
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
            icon: '✅',
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
        { icon: '⚡', title: 'Rapidité', desc: 'Réponse sous 7 jours ouvrés' },
        { icon: '🔒', title: 'Sécurité', desc: 'Données chiffrées' },
        { icon: '👤', title: 'Accompagnement', desc: 'Un conseiller dédié' },
        { icon: '💰', title: 'Transparence', desc: 'Aucun frais caché' },
        { icon: '📱', title: '100% en ligne', desc: 'Gérez où vous voulez' },
        { icon: '🎯', title: 'Sur-mesure', desc: 'Solutions adaptées' }
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
                                            <span className="step-icon-finom">{step.icon}</span>
                                            <div>
                                                <h3>{step.title}</h3>
                                                <span className="step-duration">⏱️ {step.duration}</span>
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

                {/* Advantages */}
                <section className="advantages-section-finom">
                    <div className="container">
                        <h2 className="section-title">Les avantages FINOM</h2>
                        <div className="advantages-grid-finom">
                            {advantages.map((adv, idx) => (
                                <div 
                                    key={idx} 
                                    className="advantage-card-finom fade-in"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    <span className="advantage-icon-finom">{adv.icon}</span>
                                    <h4>{adv.title}</h4>
                                    <p>{adv.desc}</p>
                                </div>
                            ))}
                        </div>
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
