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
    name: 'FINOM',
    email: 'contact@pret-finom.co',
    phone: '01 87 68 08 90',
    address: '9 Rue du Quatre Septembre, 75002 Paris, France',
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
                    <header className="contact-header contact-header--compact">
                        <div className="secure-badge secure-badge--small">
                            <span className="lock-icon">🔒</span>
                            Connexion sécurisée
                        </div>
                        <h1 className="contact-title">Nous contacter</h1>
                        <p className="contact-subtitle contact-subtitle--compact">
                            Notre équipe est à votre disposition pour toute question relative à votre projet de financement.
                        </p>
                    </header>

                    <div className="contact-grid">
                        <div className="contact-form-section">
                            <div className="card contact-form-card">
                                <h3 className="contact-section-title">Envoyer un message</h3>
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
                            <div className="card contact-details contact-details--compact">
                                <h3 className="contact-section-title">Coordonnées</h3>
                                <div className="contact-method contact-method--compact">
                                    <div className="method-icon method-icon--small">📍</div>
                                    <div className="method-content">
                                        <h4 className="method-label">Adresse</h4>
                                        <p className="method-value">9 Rue du Quatre Septembre<br />75002 Paris, France</p>
                                    </div>
                                </div>
                                <div className="contact-method contact-method--compact">
                                    <div className="method-icon method-icon--small">📞</div>
                                    <div className="method-content">
                                        <h4 className="method-label">Téléphone</h4>
                                        <p className="method-value"><a href="tel:0187680890">01 87 68 08 90</a></p>
                                    </div>
                                </div>
                                <div className="contact-method contact-method--compact">
                                    <div className="method-icon method-icon--small">✉️</div>
                                    <div className="method-content">
                                        <h4 className="method-label">Email</h4>
                                        <p className="method-value"><a href={`mailto:${companyInfo.email}`}>{companyInfo.email}</a></p>
                                    </div>
                                </div>
                                <div className="contact-hours">
                                    <p className="hours-label">Horaires d'ouverture</p>
                                    <p className="hours-value">{companyInfo.supportHours.weekdays}</p>
                                    <p className="hours-value">{companyInfo.supportHours.weekend}</p>
                                </div>
                            </div>
                            <div className="card faq-suggestion faq-suggestion--compact">
                                <h4 className="faq-title">Questions fréquentes</h4>
                                <p className="faq-text">Consultez notre FAQ pour des réponses rapides.</p>
                                <Link to="/faq">
                                    <Button variant="secondary" size="sm" className="full-width">Accéder à la FAQ</Button>
                                </Link>
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
