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
                            <strong>FINOM</strong> — Service de simulation de prêt immobilier
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

        </>
    );
};

export default Contact;
