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

            </div>
        </>
    );
};

export default Faq;
