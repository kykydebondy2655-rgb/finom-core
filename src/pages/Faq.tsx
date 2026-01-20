import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/finom/Button';
import { List, Home, FileText, Percent, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { useSEO, SEO_CONFIGS } from '@/hooks/useSEO';

const Faq = () => {
    // SEO anti-phishing: signaux de confiance
    useSEO(SEO_CONFIGS.faq);
    
    const [activeCategory, setActiveCategory] = useState('all');
    const [openQuestion, setOpenQuestion] = useState<string | null>(null);

    const categories = [
        { id: 'all', label: 'Toutes les questions', Icon: List },
        { id: 'credit', label: 'Crédit immobilier', Icon: Home },
        { id: 'dossier', label: 'Constitution du dossier', Icon: FileText },
        { id: 'conditions', label: 'Conditions & Taux', Icon: Percent },
        { id: 'securite', label: 'Sécurité', Icon: Lock }
    ];

    const faqData = [
        {
            category: 'credit',
            questions: [
                {
                    q: 'FINOM délivre-t-elle directement des crédits immobiliers ?',
                    a: 'Oui, FINOM est un établissement bancaire qui finance directement les projets immobiliers de ses clients.'
                },
                {
                    q: 'Quels types de projets immobiliers financez-vous ?',
                    a: "Nous finançons l'acquisition de résidences principales, secondaires et investissements locatifs."
                },
                {
                    q: 'Comment fonctionne la simulation de crédit ?',
                    a: "Notre simulateur vous permet d'estimer votre capacité d'emprunt et vos mensualités en quelques clics. Gratuit et sans engagement."
                }
            ]
        },
        {
            category: 'dossier',
            questions: [
                {
                    q: 'Quels documents dois-je fournir ?',
                    a: "Pièce d'identité, justificatifs de revenus, relevés bancaires et justificatif de domicile."
                },
                {
                    q: 'Comment est analysée ma demande ?',
                    a: "Nos analystes étudient votre situation financière globale pour vous proposer les meilleures conditions."
                }
            ]
        },
        {
            category: 'conditions',
            questions: [
                {
                    q: 'Les taux affichés sont-ils garantis ?',
                    a: "Les taux sont indicatifs. Le taux définitif dépend de l'étude de votre dossier."
                },
                {
                    q: "Qu'est-ce que le TAEG ?",
                    a: "Le Taux Annuel Effectif Global représente le coût total de votre crédit incluant intérêts et frais."
                }
            ]
        },
        {
            category: 'securite',
            questions: [
                {
                    q: 'Mes données sont-elles sécurisées ?',
                    a: 'Toutes vos données sont chiffrées et hébergées sur des serveurs sécurisés en Europe.'
                },
                {
                    q: 'FINOM est-elle régulée ?',
                    a: "FINOM opère avec des établissements agréés par l'ACPR et la BaFin."
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
            <div className="faq-page-finom">
                {/* Hero */}
                <section className="faq-hero fade-in">
                    <div className="container">
                        <span className="badge-finom">FAQ</span>
                        <h1>Questions fréquentes</h1>
                        <p className="hero-subtitle">
                            Retrouvez les réponses à vos questions sur le crédit immobilier.
                        </p>
                    </div>
                </section>

                <div className="container">
                    <div className="faq-layout-finom">
                        {/* Sidebar */}
                        <aside className="faq-sidebar-finom fade-in">
                            <h3>Catégories</h3>
                            <nav className="category-nav-finom">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`category-btn-finom ${activeCategory === cat.id ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(cat.id)}
                                    >
                                        <cat.Icon className="cat-icon-lucide" size={18} />
                                        <span>{cat.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </aside>

                        {/* Content */}
                        <main className="faq-content-finom">
                            <div className="faq-list-finom">
                                {filteredQuestions.map((item, idx) => (
                                    <div 
                                        key={idx}
                                        className={`faq-item-finom fade-in ${openQuestion === `${item.category}-${idx}` ? 'open' : ''}`}
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <button 
                                            className="faq-question-finom"
                                            onClick={() => setOpenQuestion(
                                                openQuestion === `${item.category}-${idx}` ? null : `${item.category}-${idx}`
                                            )}
                                        >
                                            <span>{item.q}</span>
                                            <span className="faq-toggle-finom">
                                                {openQuestion === `${item.category}-${idx}` ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </span>
                                        </button>
                                        {openQuestion === `${item.category}-${idx}` && (
                                            <div className="faq-answer-finom">
                                                <p>{item.a}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="faq-cta-finom">
                                <h3>Vous avez d'autres questions ?</h3>
                                <p>Nos conseillers sont à votre disposition.</p>
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
