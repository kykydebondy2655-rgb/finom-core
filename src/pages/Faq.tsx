import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Button from '../components/finom/Button';

const Faq = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [openQuestion, setOpenQuestion] = useState<string | null>(null);

    const categories = [
        { id: 'all', label: 'Toutes les questions', icon: '📋' },
        { id: 'simulation', label: 'Simulation & Taux', icon: '🧮' },
        { id: 'dossier', label: 'Constitution du dossier', icon: '📝' },
        { id: 'delais', label: 'Délais & Étapes', icon: '⏱️' },
        { id: 'securite', label: 'Sécurité', icon: '🔒' }
    ];

    const faqData = [
        {
            category: 'simulation',
            questions: [
                {
                    q: 'Comment fonctionne le simulateur de crédit immobilier ?',
                    a: "Notre simulateur vous permet d'estimer votre capacité d'emprunt et vos mensualités en quelques clics."
                },
                {
                    q: 'Les taux affichés dans le simulateur sont-ils garantis ?',
                    a: "Les taux affichés sont indicatifs et basés sur les conditions du marché."
                }
            ]
        },
        {
            category: 'dossier',
            questions: [
                {
                    q: 'Quels documents dois-je fournir ?',
                    a: "Pièce d'identité, justificatifs de revenus, relevés bancaires, et justificatif de domicile."
                }
            ]
        },
        {
            category: 'delais',
            questions: [
                {
                    q: 'Combien de temps pour obtenir une réponse ?',
                    a: "Pour un dossier complet, comptez en moyenne 5 à 7 jours ouvrés pour une réponse de principe."
                }
            ]
        },
        {
            category: 'securite',
            questions: [
                {
                    q: 'Mes données sont-elles sécurisées ?',
                    a: 'Toutes vos données sont chiffrées et hébergées sur des serveurs sécurisés en France.'
                }
            ]
        }
    ];

    const filteredQuestions = activeCategory === 'all' 
        ? faqData.flatMap(cat => cat.questions.map(q => ({ ...q, category: cat.category })))
        : faqData.find(cat => cat.category === activeCategory)?.questions.map(q => ({ ...q, category: activeCategory })) || [];

    return (
        <>
            <Header />
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
                    .faq-list {
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                    }
                    .faq-item {
                        background: white;
                        border-radius: var(--radius-lg);
                        overflow: hidden;
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
        </>
    );
};

export default Faq;
