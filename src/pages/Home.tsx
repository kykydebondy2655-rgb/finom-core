import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

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
                                Votre projet immobilier <br />
                                avec <span className="highlight">FINOM</span>
                            </h1>
                            <p className="hero-subtitle">
                                Simulateur de prêt immobilier.
                                Simulation gratuite, sans engagement, 100% confidentielle.
                            </p>
                            <div className="cta-group">
                                <Link to="/simulator">
                                    <button className="btn-pill btn-primary cta-button-large">
                                        Simuler mon prêt gratuitement
                                    </button>
                                </Link>
                                <Link to="/how-it-works" className="btn-secondary-link">
                                    Comment ça marche ?
                                </Link>
                            </div>
                            <div className="trust-markers">
                                <span className="trust-item">🛡️ Données chiffrées</span>
                                <span className="trust-item">🇪🇺 Conforme RGPD</span>
                                <span className="trust-item">📋 Sans engagement</span>
                            </div>
                            <p className="no-data-warning">
                                Aucune donnée bancaire ni IBAN demandé lors de la simulation.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="how-it-works" className="section-features">
                    <div className="container">
                        <h2 className="text-center section-title">Pourquoi choisir FINOM ?</h2>
                        <div className="bento-grid">
                            <div className="card feature-card">
                                <div className="icon-box">📊</div>
                                <h3>Simulation Transparente</h3>
                                <p>Obtenez une proposition détaillée en quelques minutes. Sans engagement, sans frais cachés.</p>
                            </div>
                            <div className="card feature-card">
                                <div className="icon-box">🔒</div>
                                <h3>Données Sécurisées</h3>
                                <p>Vos documents sont chiffrés et hébergés en Europe. Conformité RGPD garantie.</p>
                            </div>
                            <div className="card feature-card">
                                <div className="icon-box">👨‍💼</div>
                                <h3>Conseiller Dédié</h3>
                                <p>Un expert vous accompagne du début à la signature chez le notaire.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security Reassurance Section */}
                <section className="section-security">
                    <div className="container">
                        <div className="security-content">
                            <h2>Votre sécurité, notre priorité</h2>
                            <div className="security-grid">
                                <div className="security-item">
                                    <span className="security-icon">🔐</span>
                                    <div>
                                        <strong>Connexion HTTPS</strong>
                                        <p>Toutes vos données transitent via une connexion chiffrée SSL/TLS.</p>
                                    </div>
                                </div>
                                <div className="security-item">
                                    <span className="security-icon">🇪🇺</span>
                                    <div>
                                        <strong>Hébergement Européen</strong>
                                        <p>Vos informations sont stockées sur des serveurs conformes au RGPD.</p>
                                    </div>
                                </div>
                                <div className="security-item">
                                    <span className="security-icon">✅</span>
                                    <div>
                                        <strong>Partenaires Agréés</strong>
                                        <p>Nous travaillons avec Treezor (ACPR) et Solaris (BaFin).</p>
                                    </div>
                                </div>
                                <div className="security-item">
                                    <span className="security-icon">🚫</span>
                                    <div>
                                        <strong>Aucun Paiement Requis</strong>
                                        <p>Nous ne demandons jamais vos coordonnées bancaires pour la simulation.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Domain Display */}
                <section className="section-domain">
                    <div className="container">
                        <p className="domain-display">
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