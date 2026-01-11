import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';

const Home = () => {
    return (
        <>
            <Header />
            <div className="home-page">
                {/* Hero Section */}
                <section className="hero">
                    <div className="container hero-container">
                        <div className="hero-content fade-in">
                            <div className="badge-new">Nouveau: Taux Boostés 🚀</div>
                            <h1>
                                Réalisez votre rêve <br />
                                avec <span className="highlight">FINOM</span>
                            </h1>
                            <p className="hero-subtitle">
                                La banque qui simplifie votre financement immobilier.
                                Simulation instantanée, dossier 100% digital.
                            </p>
                            <div className="cta-group">
                                <Link to="/simulator">
                                    <button className="btn-pill btn-primary" style={{ fontSize: '1.1rem' }}>Simuler mon prêt</button>
                                </Link>
                                <a href="#how-it-works" className="btn-secondary-link">
                                    Comment ça marche ?
                                </a>
                            </div>
                            <div className="trust-markers">
                                <span className="trust-item">🛡️ Sécurité Bancaire</span>
                                <span className="trust-item">⚡ Réponse 24h</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="how-it-works" className="section-features">
                    <div className="container">
                        <h2 className="text-center section-title">Pourquoi choisir FINOM ?</h2>
                        <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                            <div className="card feature-card">
                                <div className="icon-box">🚀</div>
                                <h3>Simulation Rapide</h3>
                                <p>Obtenez une proposition détaillée en moins de 3 minutes. Sans engagement.</p>
                            </div>
                            <div className="card feature-card">
                                <div className="icon-box">🔒</div>
                                <h3>Dossier Sécurisé</h3>
                                <p>Vos documents sont cryptés et stockés en Europe. Conformité RGPD totale.</p>
                            </div>
                            <div className="card feature-card">
                                <div className="icon-box">👨‍💼</div>
                                <h3>Expert Dédié</h3>
                                <p>Un conseiller unique suit votre dossier du début à la signature.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <style>{`
                    .hero {
                        background: var(--color-white);
                        padding: 8rem 0 6rem;
                        overflow: hidden;
                        border-bottom: 1px solid rgba(0,0,0,0.05);
                    }
                    .hero-container {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 3rem;
                        text-align: center;
                    }
                    .badge-new {
                        display: inline-block;
                        background: #FFF0F9;
                        color: var(--color-primary);
                        padding: 0.6rem 1.25rem;
                        border-radius: 100px;
                        font-weight: 700;
                        font-size: 0.8rem;
                        margin-bottom: 2rem;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    }
                    .hero-subtitle {
                        font-size: 1.5rem;
                        color: var(--color-text-secondary);
                        margin-bottom: 3rem;
                        line-height: 1.4;
                        max-width: 550px;
                        margin-left: auto;
                        margin-right: auto;
                    }
                    .cta-group {
                        display: flex;
                        gap: 2rem;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 4rem;
                    }
                    .btn-secondary-link {
                        font-weight: 700;
                        color: var(--color-secondary);
                        border-bottom: 2px solid var(--color-primary);
                        padding-bottom: 2px;
                    }
                    .trust-markers {
                        display: flex;
                        gap: 1.5rem;
                        justify-content: center;
                    }
                    .trust-item {
                        background: #F1F5F9;
                        padding: 0.5rem 1rem;
                        border-radius: 8px;
                        font-size: 0.85rem;
                        font-weight: 600;
                        color: #475569;
                    }
                    .section-features {
                        padding: 10rem 0;
                        background: #F3F6F6;
                    }
                    @media (max-width: 968px) {
                        .hero { padding: 4rem 0; }
                        .hero-subtitle { font-size: 1.1rem; }
                        .cta-group { flex-direction: column; gap: 1rem; }
                        .section-features { padding: 6rem 0; }
                    }
                `}</style>
            </div>
        </>
    );
};

export default Home;
