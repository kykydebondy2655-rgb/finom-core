import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/finom/Button';

const Faq = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [openQuestion, setOpenQuestion] = useState<string | null>(null);

    const categories = [
        { id: 'all', label: 'Toutes les questions', icon: '📋' },
        { id: 'simulation', label: 'Simulation & Taux', icon: '🧮' },
        { id: 'dossier', label: 'Constitution du dossier', icon: '📝' },
        { id: 'documents', label: 'Documents & Validations', icon: '📄' },
        { id: 'delais', label: 'Délais & Étapes', icon: '⏱️' },
        { id: 'assurance', label: 'Assurance emprunteur', icon: '🛡️' },
        { id: 'frais', label: 'Frais', icon: '💰' },
        { id: 'securite', label: 'Sécurité & Confidentialité', icon: '🔒' },
        { id: 'compte', label: 'Compte bancaire', icon: '🏦' },
        { id: 'support', label: 'Support & Contact', icon: '💬' }
    ];

    const faqData = [
        {
            category: 'simulation',
            questions: [
                {
                    q: 'Comment fonctionne le simulateur de crédit immobilier ?',
                    a: "Notre simulateur vous permet d'estimer votre capacité d'emprunt et vos mensualités en quelques clics. Vous renseignez le montant souhaité, la durée du prêt, et vos revenus. Le simulateur calcule instantanément vos mensualités, le coût total du crédit, et votre taux d'endettement."
                },
                {
                    q: 'Les taux affichés dans le simulateur sont-ils garantis ?',
                    a: "Les taux affichés sont indicatifs et basés sur les conditions du marché. Le taux définitif sera confirmé lors de l'étude de votre dossier et dépendra de votre profil emprunteur."
                }
            ]
        },
        {
            category: 'dossier',
            questions: [
                {
                    q: 'Quels documents dois-je fournir ?',
                    a: "Les documents essentiels incluent : pièce d'identité, justificatifs de revenus (3 derniers bulletins de salaire, avis d'imposition), relevés bancaires (3 derniers mois), et justificatif de domicile."
                },
                {
                    q: 'Puis-je sauvegarder mon dossier et le reprendre plus tard ?',
                    a: 'Oui, vous pouvez sauvegarder votre dossier à tout moment et le reprendre quand vous le souhaitez depuis votre espace client.'
                }
            ]
        },
        {
            category: 'delais',
            questions: [
                {
                    q: 'Combien de temps pour obtenir une réponse ?',
                    a: "Pour un dossier complet, comptez en moyenne 5 à 7 jours ouvrés pour recevoir une réponse de principe. L'offre de prêt définitive est généralement émise sous 2 à 3 semaines."
                }
            ]
        },
        {
            category: 'assurance',
            questions: [
                {
                    q: "L'assurance emprunteur est-elle obligatoire ?",
                    a: "L'assurance emprunteur n'est pas légalement obligatoire mais est exigée par la quasi-totalité des banques pour garantir le remboursement du prêt en cas de décès, invalidité ou incapacité de travail."
                }
            ]
        },
        {
            category: 'frais',
            questions: [
                {
                    q: 'Quels sont les frais liés au crédit immobilier ?',
                    a: 'Les principaux frais incluent : les frais de dossier, les frais de garantie (hypothèque ou caution), les frais de notaire, et le coût de l\'assurance emprunteur.'
                }
            ]
        },
        {
            category: 'securite',
            questions: [
                {
                    q: 'Mes données sont-elles sécurisées ?',
                    a: 'Absolument. Toutes vos données sont chiffrées et hébergées sur des serveurs sécurisés en France. Nous respectons le RGPD et ne partageons jamais vos informations sans votre consentement.'
                }
            ]
        },
        {
            category: 'compte',
            questions: [
                {
                    q: 'Comment créer mon compte ?',
                    a: "La création de compte est gratuite et prend moins de 2 minutes. Cliquez sur 'Créer un compte' et suivez les étapes de vérification."
                }
            ]
        },
        {
            category: 'support',
            questions: [
                {
                    q: 'Comment contacter le support ?',
                    a: 'Vous pouvez nous joindre par email, téléphone, ou via le formulaire de contact. Notre équipe répond sous 24-48h ouvrées.'
                }
            ]
        }
    ];

    const filteredQuestions = activeCategory === 'all' 
        ? faqData.flatMap(cat => cat.questions.map(q => ({ ...q, category: cat.category })))
        : faqData.find(cat => cat.category === activeCategory)?.questions.map(q => ({ ...q, category: activeCategory })) || [];

    return (
        <div className="faq-page">
            <div className="container">
                <header className="faq-header">
                    <h1>❓ Foire aux Questions</h1>
                    <p className="faq-subtitle">
                        Trouvez rapidement des réponses à vos questions sur le crédit immobilier.
                    </p>
                </header>

                <div className="faq-layout">
                    <aside className="faq-sidebar">
                        <h3>Catégories</h3>
                        <nav className="category-nav">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat.id)}
                                >
                                    <span className="cat-icon">{cat.icon}</span>
                                    <span>{cat.label}</span>
                                </button>
                            ))}
                        </nav>
                    </aside>

                    <main className="faq-content">
                        <div className="faq-list">
                            {filteredQuestions.map((item, idx) => (
                                <div 
                                    key={idx}
                                    className={`faq-item ${openQuestion === `${item.category}-${idx}` ? 'open' : ''}`}
                                >
                                    <button 
                                        className="faq-question"
                                        onClick={() => setOpenQuestion(
                                            openQuestion === `${item.category}-${idx}` ? null : `${item.category}-${idx}`
                                        )}
                                    >
                                        <span>{item.q}</span>
                                        <span className="faq-toggle">
                                            {openQuestion === `${item.category}-${idx}` ? '−' : '+'}
                                        </span>
                                    </button>
                                    {openQuestion === `${item.category}-${idx}` && (
                                        <div className="faq-answer">
                                            <p>{item.a}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="faq-cta">
                            <h3>Vous n'avez pas trouvé votre réponse ?</h3>
                            <p>Notre équipe est à votre disposition pour répondre à toutes vos questions.</p>
                            <div className="cta-buttons">
                                <Link to="/contact">
                                    <Button variant="primary">Nous contacter</Button>
                                </Link>
                                <Link to="/simulator">
                                    <Button variant="secondary">Faire une simulation</Button>
                                </Link>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <style>{`
                .faq-page {
                    min-height: 100vh;
                    background: var(--color-bg);
                    padding: 4rem 0;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }

                .faq-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .faq-header h1 {
                    font-size: 2.5rem;
                    color: var(--color-primary);
                    margin-bottom: 1rem;
                }

                .faq-subtitle {
                    font-size: 1.1rem;
                    color: var(--color-text-secondary);
                }

                .faq-layout {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 2rem;
                    align-items: start;
                }

                .faq-sidebar {
                    background: white;
                    padding: 1.5rem;
                    border-radius: var(--radius-lg);
                    position: sticky;
                    top: 2rem;
                }

                .faq-sidebar h3 {
                    margin: 0 0 1rem;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--color-text-tertiary);
                }

                .category-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .category-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    border: none;
                    background: transparent;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                    color: var(--color-text-secondary);
                    font-size: 0.9rem;
                }

                .category-btn:hover {
                    background: #f8fafc;
                    color: var(--color-text);
                }

                .category-btn.active {
                    background: var(--color-primary);
                    color: white;
                }

                .cat-icon {
                    font-size: 1.1rem;
                }

                .faq-content {
                    min-height: 400px;
                }

                .faq-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .faq-item {
                    background: white;
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    transition: box-shadow 0.2s;
                }

                .faq-item:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }

                .faq-question {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem 1.5rem;
                    border: none;
                    background: none;
                    cursor: pointer;
                    text-align: left;
                    font-weight: 600;
                    color: var(--color-text);
                    font-size: 1rem;
                }

                .faq-toggle {
                    font-size: 1.5rem;
                    color: var(--color-primary);
                    font-weight: 300;
                }

                .faq-answer {
                    padding: 0 1.5rem 1.5rem;
                    border-top: 1px solid var(--color-border);
                }

                .faq-answer p {
                    margin: 1rem 0 0;
                    color: var(--color-text-secondary);
                    line-height: 1.7;
                }

                .faq-cta {
                    margin-top: 3rem;
                    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
                    padding: 2.5rem;
                    border-radius: var(--radius-lg);
                    text-align: center;
                    color: white;
                }

                .faq-cta h3 {
                    margin: 0 0 0.5rem;
                    color: white;
                }

                .faq-cta p {
                    margin: 0 0 1.5rem;
                    opacity: 0.9;
                }

                .cta-buttons {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                @media (max-width: 900px) {
                    .faq-layout {
                        grid-template-columns: 1fr;
                    }
                    .faq-sidebar {
                        position: static;
                    }
                    .category-nav {
                        flex-direction: row;
                        flex-wrap: wrap;
                    }
                }
            `}</style>
        </div>
    );
};

export default Faq;
