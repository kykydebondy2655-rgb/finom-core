import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
            description: "Estimez votre capacité d'emprunt et vos mensualités gratuitement et sans engagement.",
            details: [
                'Renseignez le montant souhaité et la durée',
                'Indiquez vos revenus et charges',
                'Obtenez instantanément une estimation de vos mensualités',
                'Sauvegardez votre simulation pour la reprendre plus tard'
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
                'Renseignez votre situation personnelle et professionnelle',
                'Décrivez votre projet immobilier',
                'Sauvegardez en brouillon et reprenez quand vous voulez'
            ]
        },
        {
            number: 3,
            icon: '📄',
            title: 'Upload des documents',
            duration: '15-20 minutes',
            description: 'Transmettez vos justificatifs de manière sécurisée depuis votre espace client.',
            details: [
                "Uploadez vos pièces d'identité",
                "Ajoutez vos bulletins de salaire et avis d'imposition",
                'Joignez vos relevés bancaires',
                'Suivez la validation de chaque document en temps réel'
            ]
        },
        {
            number: 4,
            icon: '🔍',
            title: 'Analyse et étude',
            duration: '5-7 jours ouvrés',
            description: 'Nos experts analysent votre dossier et étudient votre capacité de financement.',
            details: [
                'Vérification de la complétude du dossier',
                'Analyse de votre situation financière',
                "Calcul de votre capacité d'emprunt réelle",
                "Communication régulière sur l'avancement"
            ]
        },
        {
            number: 5,
            icon: '✅',
            title: 'Décision et offre',
            duration: '2-3 jours ouvrés',
            description: "Recevez votre décision et, en cas d'accord, votre offre de prêt personnalisée.",
            details: [
                'Notification de la décision (accord de principe ou refus)',
                "Édition de l'offre de prêt si accord",
                'Délai légal de réflexion de 10 jours',
                "Signature électronique de l'offre",
                'Déblocage des fonds après conditions suspensives'
            ]
        }
    ];

    const faqItems = [
        {
            q: 'Combien de temps prend le processus complet ?',
            a: "De la simulation à l'obtention de l'offre de prêt, comptez en moyenne 2 à 3 semaines pour un dossier complet et sans particularité."
        },
        {
            q: "Puis-je suivre l'avancement de mon dossier ?",
            a: 'Oui, votre espace client affiche en temps réel le statut de votre dossier. Vous recevez également des notifications par email à chaque étape importante.'
        },
        {
            q: 'Que se passe-t-il si mon dossier est incomplet ?',
            a: 'Si des documents manquent ou sont illisibles, vous serez contacté sous 48h avec la liste précise des éléments à fournir.'
        },
        {
            q: 'Puis-je modifier mon dossier après soumission ?',
            a: "Tant que votre dossier n'est pas en cours d'analyse, vous pouvez le modifier. Une fois l'analyse démarrée, contactez votre conseiller."
        }
    ];

    return (
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

                <section className="how-faq">
                    <h2>❓ Questions fréquentes</h2>
                    <div className="faq-list">
                        {faqItems.map((item, idx) => (
                            <div 
                                key={idx} 
                                className={`faq-item ${openFaq === idx ? 'open' : ''}`}
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                            >
                                <div className="faq-question">
                                    <span>{item.q}</span>
                                    <span className="faq-toggle">{openFaq === idx ? '−' : '+'}</span>
                                </div>
                                {openFaq === idx && (
                                    <div className="faq-answer">{item.a}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="how-advantages">
                    <h2>✨ Les avantages FINOM</h2>
                    <div className="advantages-grid">
                        {[
                            { icon: '⚡', title: 'Rapidité', desc: 'Réponse de principe sous 7 jours ouvrés' },
                            { icon: '🔒', title: 'Sécurité', desc: 'Données chiffrées et hébergées en France' },
                            { icon: '👤', title: 'Accompagnement', desc: 'Un conseiller dédié vous guide' },
                            { icon: '💰', title: 'Transparence', desc: 'Aucun frais caché' },
                            { icon: '📱', title: '100% en ligne', desc: 'Gérez votre dossier où vous voulez' },
                            { icon: '🎯', title: 'Sur-mesure', desc: 'Solutions adaptées à votre profil' }
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

            <style>{`
                .how-it-works-page {
                    min-height: 100vh;
                    background: var(--color-bg);
                    padding: 4rem 0;
                }

                .container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }

                .how-header {
                    text-align: center;
                    margin-bottom: 4rem;
                }

                .how-header h1 {
                    font-size: 2.5rem;
                    color: var(--color-primary);
                    margin-bottom: 1rem;
                }

                .how-subtitle {
                    font-size: 1.2rem;
                    color: var(--color-text-secondary);
                    max-width: 600px;
                    margin: 0 auto;
                }

                .timeline {
                    position: relative;
                    padding-left: 60px;
                }

                .timeline::before {
                    content: '';
                    position: absolute;
                    left: 24px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: linear-gradient(to bottom, var(--color-primary), var(--color-secondary));
                }

                .timeline-step {
                    position: relative;
                    margin-bottom: 3rem;
                }

                .step-number {
                    position: absolute;
                    left: -60px;
                    width: 48px;
                    height: 48px;
                    background: var(--color-primary);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.25rem;
                    z-index: 1;
                }

                .step-content {
                    background: white;
                    padding: 2rem;
                    border-radius: var(--radius-lg);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }

                .step-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .step-icon {
                    font-size: 2rem;
                }

                .step-title-group h2 {
                    margin: 0;
                    font-size: 1.25rem;
                    color: var(--color-text);
                }

                .step-duration {
                    font-size: 0.85rem;
                    color: var(--color-text-tertiary);
                }

                .step-description {
                    color: var(--color-text-secondary);
                    margin-bottom: 1rem;
                }

                .step-details {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .step-details li {
                    padding: 0.5rem 0;
                    padding-left: 1.5rem;
                    position: relative;
                    color: var(--color-text-secondary);
                }

                .step-details li::before {
                    content: '✓';
                    position: absolute;
                    left: 0;
                    color: var(--color-secondary);
                    font-weight: bold;
                }

                .how-faq {
                    margin-top: 4rem;
                }

                .how-faq h2 {
                    text-align: center;
                    margin-bottom: 2rem;
                    color: var(--color-text);
                }

                .faq-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .faq-item {
                    background: white;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    cursor: pointer;
                    transition: box-shadow 0.2s;
                }

                .faq-item:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .faq-question {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem;
                    font-weight: 600;
                    color: var(--color-text);
                }

                .faq-toggle {
                    font-size: 1.5rem;
                    color: var(--color-primary);
                }

                .faq-answer {
                    padding: 0 1.25rem 1.25rem;
                    color: var(--color-text-secondary);
                    border-top: 1px solid var(--color-border);
                    padding-top: 1rem;
                }

                .how-advantages {
                    margin-top: 4rem;
                }

                .how-advantages h2 {
                    text-align: center;
                    margin-bottom: 2rem;
                    color: var(--color-text);
                }

                .advantages-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                }

                .advantage-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: var(--radius-lg);
                    text-align: center;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .advantage-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
                }

                .advantage-icon {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                }

                .advantage-card h3 {
                    margin: 0 0 0.5rem;
                    color: var(--color-text);
                }

                .advantage-card p {
                    margin: 0;
                    font-size: 0.9rem;
                    color: var(--color-text-secondary);
                }

                .how-cta {
                    margin-top: 4rem;
                }

                .cta-card {
                    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
                    color: white;
                    padding: 3rem;
                    border-radius: var(--radius-lg);
                    text-align: center;
                }

                .cta-card h2 {
                    margin: 0 0 1rem;
                    color: white;
                }

                .cta-card p {
                    margin: 0 0 2rem;
                    opacity: 0.9;
                }

                .cta-buttons {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                @media (max-width: 768px) {
                    .advantages-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .timeline {
                        padding-left: 50px;
                    }
                    .step-number {
                        left: -50px;
                        width: 40px;
                        height: 40px;
                    }
                }

                @media (max-width: 480px) {
                    .advantages-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .fade-in {
                    animation: fadeIn 0.5s ease-out forwards;
                    opacity: 0;
                }

                @keyframes fadeIn {
                    to { opacity: 1; transform: translateY(0); }
                    from { opacity: 0; transform: translateY(20px); }
                }
            `}</style>
        </div>
    );
};

export default HowItWorks;
