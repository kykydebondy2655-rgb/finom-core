import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/finom/Button';

/**
 * Page Contact - Positionnement bancaire
 * Coordonnées officielles de l'établissement FINOM
 */
const companyInfo = {
    name: 'FINOM Payments B.V.',
    email: 'contact@pret-finom.co',
    phone: '+31 20 524 9111',
    address: 'Jachthavenweg 109H, 1081 KM Amsterdam, Pays-Bas',
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
                        <h1>Contactez nos conseillers</h1>
                        <p className="contact-subtitle">
                            Notre équipe bancaire est à votre écoute pour répondre à vos questions
                            et vous accompagner dans votre projet de financement immobilier.
                        </p>
                        <p className="company-identifier">
                            <strong>FINOM</strong> — Établissement bancaire spécialisé en crédit immobilier
                        </p>
                    </header>

                    <div className="contact-grid">
                        <div className="contact-form-section">
                            <div className="card">
                                <h2>Envoyez-nous un message</h2>
                                {submitted && (
                                    <div className="success-message">
                                        ✅ Votre message a été envoyé. Un conseiller vous répondra sous 24-48h.
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
                                        <label htmlFor="subject">Objet de votre demande *</label>
                                        <select
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="form-input"
                                            required
                                        >
                                            <option value="">Sélectionnez un sujet</option>
                                            <option value="simulation">Question sur ma simulation de crédit</option>
                                            <option value="dossier">Suivi de ma demande de financement</option>
                                            <option value="documents">Documents à fournir</option>
                                            <option value="conditions">Conditions de crédit et taux</option>
                                            <option value="autre">Autre demande</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="message">Votre message *</label>
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
                                        <h4>Siège social</h4>
                                        <p>{companyInfo.address}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card faq-suggestion">
                                <h3>Consultez notre FAQ</h3>
                                <p>Retrouvez les réponses aux questions les plus fréquentes sur le crédit immobilier.</p>
                                <Link to="/faq">
                                    <Button variant="secondary" className="full-width">Voir la FAQ</Button>
                                </Link>
                            </div>

                            <div className="card security-notice">
                                <h3>🔐 Engagement de sécurité</h3>
                                <ul>
                                    <li>Vos données sont protégées selon les normes bancaires</li>
                                    <li>Connexion sécurisée HTTPS/SSL</li>
                                    <li>Conformité RGPD et réglementations européennes</li>
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

        </>
    );
};

export default Contact;
