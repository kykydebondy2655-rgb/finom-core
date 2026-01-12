import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Button from '../components/finom/Button';

const HowItWorks = () => {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState<number | null>(null);

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

    return (
        <>
            <Header />
            <div className="how-it-works-page">
                <div className="container">
                    <header className="how-header">
                        <h1>🚀 Comment ça marche ?</h1>
                        <p className="how-subtitle">
                            Obtenez votre crédit immobilier en 5 étapes simples.
                            Un parcours 100% en ligne, transparent et sécurisé.
                        </p>
                    </header>

                    <div className="timeline">
                        {steps.map((step, idx) => (
                            <div key={idx} className="timeline-step fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className="step-number">{step.number}</div>
                                <div className="step-content">
                                    <div className="step-header">
                                        <div className="step-icon">{step.icon}</div>
                                        <div className="step-title-group">
                                            <h2>{step.title}</h2>
                                            <span className="step-duration">⏱️ {step.duration}</span>
                                        </div>
                                    </div>
                                    <p className="step-description">{step.description}</p>
                                    <ul className="step-details">
                                        {step.details.map((detail, dIdx) => (
                                            <li key={dIdx}>{detail}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>

                    <section className="how-advantages">
                        <h2>✨ Les avantages FINOM</h2>
                        <div className="advantages-grid">
                            {[
                                { icon: '⚡', title: 'Rapidité', desc: 'Réponse sous 7 jours ouvrés' },
                                { icon: '🔒', title: 'Sécurité', desc: 'Données chiffrées' },
                                { icon: '👤', title: 'Accompagnement', desc: 'Un conseiller dédié' },
                                { icon: '💰', title: 'Transparence', desc: 'Aucun frais caché' },
                                { icon: '📱', title: '100% en ligne', desc: 'Gérez où vous voulez' },
                                { icon: '🎯', title: 'Sur-mesure', desc: 'Solutions adaptées' }
                            ].map((adv, idx) => (
                                <div key={idx} className="advantage-card fade-in">
                                    <div className="advantage-icon">{adv.icon}</div>
                                    <h3>{adv.title}</h3>
                                    <p>{adv.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="how-cta">
                        <div className="cta-card">
                            <h2>Prêt à démarrer votre projet ?</h2>
                            <p>Commencez par une simulation gratuite et sans engagement.</p>
                            <div className="cta-buttons">
                                <Button onClick={() => navigate('/simulator')} variant="secondary" size="lg">
                                    Faire une simulation
                                </Button>
                                <Button onClick={() => navigate('/contact')} variant="ghost" size="lg">
                                    Poser une question
                                </Button>
                            </div>
                        </div>
                    </section>
                </div>

            </div>
        </>
    );
};

export default HowItWorks;
