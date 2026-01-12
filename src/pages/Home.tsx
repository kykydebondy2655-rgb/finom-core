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
                                Courtier en prêt immobilier agréé ORIAS.
                                Simulation gratuite, sans engagement, 100% confidentielle.
                            </p>
                            <div className="cta-group">
                                <Link to="/simulator">
                                    <button className="btn-pill btn-primary" style={{ fontSize: '1.1rem' }}>
                                        Simuler mon prêt gratuitement
                                    </button>
                                </Link>
                                <Link to="/how-it-works" className="btn-secondary-link">
                                    Comment ça marche ?
                                </Link>
                            </div>
                            <div className="trust-markers">
                                <span className="trust-item">🛡️ Données chiffrées</span>
                                <span className="trust-item">✓ ORIAS - ACPR</span>
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
                        <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
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
                                <p>Un expert certifié IOBSP vous accompagne du début à la signature chez le notaire.</p>
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
                                        <strong>Courtier Agréé</strong>
                                        <p>FINOM est immatriculé ORIAS et contrôlé par l'ACPR.</p>
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

                <style>{`
                    .hero {
                        background: #FAFBFC;
                        padding: 6rem 0 5rem;
                        overflow: hidden;
                        border-bottom: 1px solid #E2E8F0;
                    }
                    .hero-container {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 3rem;
                        text-align: center;
                    }
                    .secure-badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        background: #E8F5E9;
                        color: #2E7D32;
                        padding: 0.6rem 1.25rem;
                        border-radius: 100px;
                        font-weight: 600;
                        font-size: 0.85rem;
                        margin-bottom: 2rem;
                        border: 1px solid #C8E6C9;
                    }
                    .lock-icon {
                        font-size: 1rem;
                    }
                    .hero-subtitle {
                        font-size: 1.35rem;
                        color: #64748B;
                        margin-bottom: 2.5rem;
                        line-height: 1.5;
                        max-width: 580px;
                        margin-left: auto;
                        margin-right: auto;
                    }
                    .cta-group {
                        display: flex;
                        gap: 2rem;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 2.5rem;
                    }
                    .btn-secondary-link {
                        font-weight: 600;
                        color: #475569;
                        text-decoration: underline;
                        text-underline-offset: 4px;
                    }
                    .btn-secondary-link:hover {
                        color: #1E293B;
                    }
                    .trust-markers {
                        display: flex;
                        gap: 1.5rem;
                        justify-content: center;
                        flex-wrap: wrap;
                        margin-bottom: 1.5rem;
                    }
                    .trust-item {
                        background: #F1F5F9;
                        padding: 0.6rem 1.2rem;
                        border-radius: 8px;
                        font-size: 0.9rem;
                        font-weight: 600;
                        color: #475569;
                        border: 1px solid #E2E8F0;
                    }
                    .no-data-warning {
                        font-size: 0.85rem;
                        color: #64748B;
                        font-style: italic;
                    }
                    .section-features {
                        padding: 6rem 0;
                        background: #FFFFFF;
                    }
                    .section-security {
                        padding: 5rem 0;
                        background: #F8FAFC;
                        border-top: 1px solid #E2E8F0;
                        border-bottom: 1px solid #E2E8F0;
                    }
                    .security-content h2 {
                        text-align: center;
                        font-size: 1.75rem;
                        font-weight: 700;
                        color: #1E293B;
                        margin-bottom: 3rem;
                    }
                    .security-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                        gap: 2rem;
                        max-width: 900px;
                        margin: 0 auto;
                    }
                    .security-item {
                        display: flex;
                        gap: 1rem;
                        align-items: flex-start;
                        background: white;
                        padding: 1.5rem;
                        border-radius: 12px;
                        border: 1px solid #E2E8F0;
                    }
                    .security-icon {
                        font-size: 1.5rem;
                        flex-shrink: 0;
                    }
                    .security-item strong {
                        display: block;
                        color: #1E293B;
                        font-weight: 600;
                        margin-bottom: 0.25rem;
                    }
                    .security-item p {
                        color: #64748B;
                        font-size: 0.9rem;
                        margin: 0;
                        line-height: 1.5;
                    }
                    .section-domain {
                        padding: 1.5rem 0;
                        background: #0F172A;
                    }
                    .domain-display {
                        text-align: center;
                        color: #94A3B8;
                        font-size: 0.9rem;
                        margin: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                    }
                    .domain-display strong {
                        color: #E2E8F0;
                    }
                    .domain-lock {
                        color: #22C55E;
                    }
                    @media (max-width: 968px) {
                        .hero { padding: 4rem 0 3rem; }
                        .hero-subtitle { font-size: 1.1rem; }
                        .cta-group { flex-direction: column; gap: 1rem; }
                        .section-features { padding: 4rem 0; }
                        .section-security { padding: 3rem 0; }
                        .security-content h2 { font-size: 1.5rem; }
                    }
                `}</style>
            </div>
            <Footer />
        </>
    );
};

export default Home;
