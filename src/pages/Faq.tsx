import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/finom/Button';

const Faq = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [openQuestion, setOpenQuestion] = useState<string | null>(null);

    const categories = [
        { id: 'all', label: 'Toutes les questions', icon: '📋' },
        { id: 'credit', label: 'Crédit immobilier', icon: '🏠' },
        { id: 'dossier', label: 'Constitution du dossier', icon: '📝' },
        { id: 'conditions', label: 'Conditions & Taux', icon: '💰' },
        { id: 'securite', label: 'Sécurité', icon: '🔒' }
    ];

    const faqData = [
        {
            category: 'credit',
            questions: [
                {
                    q: 'FINOM délivre-t-elle directement des crédits immobiliers ?',
                    a: 'Oui, FINOM est un établissement bancaire qui finance directement les projets immobiliers de ses clients. Nous analysons votre dossier, étudions votre solvabilité et vous proposons une offre de crédit adaptée à votre situation.'
                },
                {
                    q: 'Quels types de projets immobiliers financez-vous ?',
                    a: "Nous finançons l'acquisition de résidences principales, résidences secondaires et investissements locatifs. Nous pouvons également financer des travaux dans le cadre d'un crédit immobilier."
                },
                {
                    q: 'Comment fonctionne la simulation de crédit ?',
                    a: "Notre simulateur vous permet d'estimer votre capacité d'emprunt et vos mensualités en quelques clics. Cette simulation est gratuite, sans engagement, et vous donne une première indication sur les conditions de financement possibles."
                }
            ]
        },
        {
            category: 'dossier',
            questions: [
                {
                    q: 'Quels documents dois-je fournir pour ma demande de crédit ?',
                    a: "Pour instruire votre dossier, nous avons besoin de : pièce d'identité en cours de validité, justificatifs de revenus (3 derniers bulletins de salaire, avis d'imposition), relevés bancaires des 3 derniers mois, et justificatif de domicile. Des documents complémentaires peuvent être demandés selon votre situation."
                },
                {
                    q: 'Comment est analysée ma demande de financement ?',
                    a: "Nos analystes bancaires étudient votre situation financière globale : revenus, charges, taux d'endettement actuel, apport personnel, et stabilité professionnelle. Cette analyse nous permet de vous proposer les meilleures conditions de financement adaptées à votre profil."
                }
            ]
        },
        {
            category: 'conditions',
            questions: [
                {
                    q: 'Les taux affichés sont-ils garantis ?',
                    a: "Les taux affichés dans le simulateur sont indicatifs et basés sur les conditions actuelles du marché. Le taux définitif de votre crédit sera déterminé après l'étude complète de votre dossier et dépend de votre profil emprunteur."
                },
                {
                    q: 'Quels sont les frais liés à mon crédit immobilier ?',
                    a: "Les frais comprennent généralement : les frais de dossier, l'assurance emprunteur, et les frais de garantie. Le coût total du crédit (TAEG) vous est communiqué de manière transparente avant toute signature."
                },
                {
                    q: "Qu'est-ce que le TAEG ?",
                    a: "Le Taux Annuel Effectif Global (TAEG) représente le coût total de votre crédit exprimé en pourcentage annuel. Il inclut le taux d'intérêt, les frais de dossier, l'assurance et tous les frais obligatoires. C'est l'indicateur légal pour comparer les offres de crédit."
                }
            ]
        },
        {
            category: 'securite',
            questions: [
                {
                    q: 'Mes données personnelles sont-elles sécurisées ?',
                    a: 'Toutes vos données sont chiffrées et hébergées sur des serveurs sécurisés en Europe, conformément aux standards bancaires et au RGPD. Nous appliquons les plus hauts niveaux de sécurité pour protéger vos informations.'
                },
                {
                    q: 'FINOM est-elle une banque régulée ?',
                    a: "FINOM opère en partenariat avec des établissements bancaires agréés par les autorités de régulation européennes : Treezor (agrément ACPR en France) et Solaris (agrément BaFin en Allemagne). Nous respectons l'ensemble des obligations réglementaires applicables au crédit immobilier."
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
                        <h1>Questions fréquentes</h1>
                        <p className="faq-subtitle">
                            Retrouvez les réponses à vos questions sur le crédit immobilier et nos services bancaires.
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
                                <h3>Vous avez d'autres questions ?</h3>
                                <p>Nos conseillers bancaires sont à votre disposition pour vous accompagner dans votre projet.</p>
                                <div className="cta-buttons">
                                    <Link to="/contact">
                                        <Button variant="primary">Contacter un conseiller</Button>
                                    </Link>
                                    <Link to="/simulator">
                                        <Button variant="secondary">Simuler mon crédit</Button>
                                    </Link>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>

            </div>
            <Footer />
        </>
    );
};

export default Faq;
