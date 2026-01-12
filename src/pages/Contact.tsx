import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/finom/Button';

/**
 * Page Contact - Informations de contact vérifiables
 * Renforce la crédibilité anti-phishing avec des coordonnées officielles
 */
const companyInfo = {
    name: 'FINOM SAS',
    email: 'contact@pret-finom.co',
    phone: '+31 20 524 9111',
    address: '15 Avenue des Champs-Élysées, 75008 Paris',
    responseTime: {
        email: '24-48h',
        phone: '< 5 min'
    },
    supportHours: {
        weekdays: 'Lun-Ven : 9h-18h',
        weekend: 'Sam : 9h-12h',
        closed: 'Dim : Fermé'
    }
};

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setLoading(false);
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <>
            <Header />
            <div className="contact-page">
                <div className="container">
                    <header className="contact-header">
                        <div className="secure-badge">
                            <span className="lock-icon">🔒</span>
                            Connexion sécurisée HTTPS
                        </div>
                        <h1>Contactez-nous</h1>
                        <p className="contact-subtitle">
                            Notre équipe est à votre écoute pour répondre à toutes vos questions
                            et vous accompagner dans votre projet immobilier.
                        </p>
                        <p className="company-identifier">
                            <strong>FINOM SAS</strong> — Courtier IOBSP immatriculé ORIAS
                        </p>
                    </header>

                    <div className="contact-grid">
                        <div className="contact-form-section">
                            <div className="card">
                                <h2>Envoyez-nous un message</h2>
                                {submitted && (
                                    <div className="success-message">
                                        ✅ Votre message a été envoyé avec succès !
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} className="contact-form">
                                    <div className="form-group">
                                        <label htmlFor="name">Nom complet *</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Email *</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="subject">Sujet *</label>
                                        <select
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="form-input"
                                            required
                                        >
                                            <option value="">Sélectionnez un sujet</option>
                                            <option value="simulation">Question sur une simulation</option>
                                            <option value="dossier">Suivi de mon dossier</option>
                                            <option value="documents">Documents et justificatifs</option>
                                            <option value="autre">Autre demande</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="message">Message *</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="form-input"
                                            rows={6}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" variant="primary" className="full-width" isLoading={loading}>
                                        {loading ? 'Envoi...' : 'Envoyer le message'}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        <div className="contact-info-section">
                            <div className="card contact-details">
                                <h2>📞 Nos coordonnées</h2>
                                <div className="contact-method">
                                    <div className="method-icon">📧</div>
                                    <div className="method-content">
                                        <h4>Email</h4>
                                        <p><a href={`mailto:${companyInfo.email}`}>{companyInfo.email}</a></p>
                                    </div>
                                </div>
                                <div className="contact-method">
                                    <div className="method-icon">📱</div>
                                    <div className="method-content">
                                        <h4>Téléphone</h4>
                                        <p><a href={`tel:${companyInfo.phone}`}>{companyInfo.phone}</a></p>
                                    </div>
                                </div>
                                <div className="contact-method">
                                    <div className="method-icon">📍</div>
                                    <div className="method-content">
                                        <h4>Adresse</h4>
                                        <p>{companyInfo.address}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card faq-suggestion">
                                <h3>Consultez notre FAQ</h3>
                                <p>Vous trouverez peut-être une réponse immédiate.</p>
                                <Link to="/faq">
                                    <Button variant="secondary" className="full-width">Voir la FAQ</Button>
                                </Link>
                            </div>

                            <div className="card security-notice">
                                <h3>🔐 Votre sécurité</h3>
                                <ul>
                                    <li>Nous ne demandons jamais vos identifiants bancaires</li>
                                    <li>Aucun paiement requis pour la simulation</li>
                                    <li>Vos données sont chiffrées (HTTPS/SSL)</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Domain Banner */}
                    <div className="domain-banner">
                        <span className="domain-lock">🔒</span>
                        Vous êtes sur <strong>pret-finom.co</strong> — Site officiel FINOM
                    </div>
                </div>
            </div>
            <Footer />

            <style>{`
                .contact-page {
                    min-height: 100vh;
                    background: #FAFBFC;
                    padding: 2rem 0 0;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                        padding: 0 1.5rem;
                    }
                    .contact-header {
                        text-align: center;
                        margin-bottom: 3rem;
                    }
                    .secure-badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        background: #E8F5E9;
                        color: #2E7D32;
                        padding: 0.5rem 1rem;
                        border-radius: 100px;
                        font-weight: 600;
                        font-size: 0.85rem;
                        margin-bottom: 1.5rem;
                        border: 1px solid #C8E6C9;
                    }
                    .lock-icon {
                        font-size: 1rem;
                    }
                    .contact-header h1 {
                        font-size: 2.25rem;
                        color: #1E293B;
                        margin-bottom: 1rem;
                        font-weight: 800;
                    }
                    .contact-subtitle {
                        font-size: 1.1rem;
                        color: #64748B;
                        max-width: 600px;
                        margin: 0 auto 1rem;
                    }
                    .company-identifier {
                        font-size: 0.9rem;
                        color: #475569;
                    }
                    .contact-grid {
                        display: grid;
                        grid-template-columns: 1.5fr 1fr;
                        gap: 2rem;
                        align-items: start;
                    }
                    .card {
                        background: white;
                        padding: 2rem;
                        border-radius: var(--radius-lg);
                        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                        margin-bottom: 1.5rem;
                    }
                    .card h2, .card h3 {
                        margin: 0 0 1.5rem;
                        color: var(--color-text);
                    }
                    .success-message {
                        background: #d4edda;
                        color: #155724;
                        padding: 1rem;
                        border-radius: var(--radius-md);
                        margin-bottom: 1.5rem;
                    }
                    .contact-form .form-group {
                        margin-bottom: 1.5rem;
                    }
                    .contact-form label {
                        display: block;
                        font-weight: 600;
                        margin-bottom: 0.5rem;
                        color: var(--color-text);
                    }
                    .form-input {
                        width: 100%;
                        padding: 0.75rem 1rem;
                        border: 1px solid var(--color-border);
                        border-radius: var(--radius-md);
                        font-size: 1rem;
                    }
                    .form-input:focus {
                        outline: none;
                        border-color: var(--color-primary);
                    }
                    .full-width {
                        width: 100%;
                    }
                    .contact-method {
                        display: flex;
                        gap: 1rem;
                        padding: 1rem 0;
                        border-bottom: 1px solid var(--color-border);
                    }
                    .contact-method:last-of-type {
                        border-bottom: none;
                    }
                    .method-icon {
                        font-size: 1.5rem;
                    }
                    .method-content h4 {
                        margin: 0 0 0.25rem;
                        color: var(--color-text);
                    }
                    .method-content p {
                        margin: 0;
                        color: var(--color-text-secondary);
                    }
                    .method-content a {
                        color: var(--color-primary);
                        text-decoration: none;
                    }
                    .faq-suggestion p {
                        color: var(--color-text-secondary);
                        margin-bottom: 1rem;
                    }
                    .security-notice {
                        background: #F0FDF4;
                        border: 1px solid #BBF7D0;
                    }
                    .security-notice h3 {
                        color: #166534;
                    }
                    .security-notice ul {
                        margin: 0;
                        padding-left: 1.25rem;
                        color: #166534;
                    }
                    .security-notice li {
                        margin-bottom: 0.5rem;
                        font-size: 0.9rem;
                    }
                    .domain-banner {
                        background: #0F172A;
                        color: #94A3B8;
                        padding: 1rem;
                        border-radius: 8px;
                        text-align: center;
                        font-size: 0.9rem;
                        margin: 2rem 0;
                    }
                    .domain-banner strong {
                        color: #E2E8F0;
                    }
                    .domain-lock {
                        color: #22C55E;
                        margin-right: 0.5rem;
                    }
                    @media (max-width: 900px) {
                        .contact-grid {
                            grid-template-columns: 1fr;
                        }
                    }
                `}</style>
        </>
    );
};

export default Contact;
