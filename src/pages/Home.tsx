import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import heroImage from '@/assets/hero-mortgage.png';

const Home = () => {
    return (
        <>
            <Header />
            <div className="home-page">
                {/* Hero Section */}
                <section className="hero">
                    <div className="container hero-container">
                        <div className="hero-content fade-in">
                            <div className="secure-badge">
                                <span className="lock-icon">🔒</span>
                                Connexion sécurisée HTTPS
                            </div>
                            <h1>
                                Votre crédit immobilier <br />
                                avec <span className="highlight">FINOM</span>
                            </h1>
                            <p className="hero-subtitle">
                                FINOM vous accompagne et finance votre projet immobilier.
                                Simulation gratuite, réponse rapide, conditions transparentes.
                            </p>
                            <div className="cta-group">
                                <Link to="/simulator">
                                    <button className="btn-accent btn-pill cta-button-large">
                                        Simuler mon crédit immobilier
                                    </button>
                                </Link>
                                <Link to="/how-it-works" className="btn-secondary-link">
                                    Comment ça marche ? →
                                </Link>
                            </div>
                            <div className="trust-markers">
                                <span className="trust-item">🏦 Établissement bancaire</span>
                                <span className="trust-item">🇪🇺 Conforme RGPD</span>
                                <span className="trust-item">📋 Conditions claires</span>
                            </div>
                            <p className="no-data-warning">
                                Simulation gratuite et sans engagement. Aucun frais pour l'étude de votre dossier.
                            </p>
                        </div>
                        <div className="hero-image fade-in delay-200">
                            <img src={heroImage} alt="Financement immobilier FINOM" />
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="how-it-works" className="section-features">
                    <div className="container">
                        <h2 className="text-center section-title fade-in-up">Pourquoi financer avec FINOM ?</h2>
                        <div className="bento-grid">
                            <div className="card card-feature feature-card fade-in-up delay-100 hover-lift">
                                <div className="icon-box">📊</div>
                                <h3>Crédit sur mesure</h3>
                                <p>Nous analysons votre situation financière et vous proposons un financement adapté à votre capacité d'emprunt.</p>
                            </div>
                            <div className="card card-feature feature-card fade-in-up delay-200 hover-lift">
                                <div className="icon-box">💰</div>
                                <h3>Taux compétitifs</h3>
                                <p>Bénéficiez de conditions de financement attractives avec un TAEG transparent dès la simulation.</p>
                            </div>
                            <div className="card card-feature feature-card fade-in-up delay-300 hover-lift">
                                <div className="icon-box">👨‍💼</div>
                                <h3>Conseiller dédié</h3>
                                <p>Un expert bancaire vous accompagne de l'étude de votre dossier jusqu'au déblocage des fonds.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security Reassurance Section */}
                <section className="section-security">
                    <div className="container">
                        <div className="security-content fade-in-up">
                            <h2>Un établissement bancaire fiable</h2>
                            <div className="security-grid">
                                <div className="security-item hover-lift">
                                    <span className="security-icon">🔐</span>
                                    <div>
                                        <strong>Sécurité bancaire</strong>
                                        <p>Toutes vos données transitent via une connexion chiffrée SSL/TLS.</p>
                                    </div>
                                </div>
                                <div className="security-item hover-lift">
                                    <span className="security-icon">🇪🇺</span>
                                    <div>
                                        <strong>Conformité européenne</strong>
                                        <p>Respect des directives bancaires européennes et du RGPD.</p>
                                    </div>
                                </div>
                                <div className="security-item hover-lift">
                                    <span className="security-icon">✅</span>
                                    <div>
                                        <strong>Partenaires agréés</strong>
                                        <p>Nous travaillons avec Treezor (ACPR) et Solaris (BaFin).</p>
                                    </div>
                                </div>
                                <div className="security-item hover-lift">
                                    <span className="security-icon">🏦</span>
                                    <div>
                                        <strong>Financement direct</strong>
                                        <p>FINOM délivre directement votre crédit immobilier, sans intermédiaire.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Domain Display */}
                <section className="section-domain">
                    <div className="container">
                        <p className="domain-display fade-in">
                            <span className="domain-lock">🔒</span>
                            Vous êtes sur <strong>pret-finom.co</strong> — Site officiel FINOM
                        </p>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
};

export default Home;
