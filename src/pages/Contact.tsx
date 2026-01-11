import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/finom/Button';

const companyInfo = {
    name: 'FINOM',
    email: 'contact@finom.fr',
    phone: '+33 1 23 45 67 89',
    address: '123 Avenue des Champs-Élysées, 75008 Paris',
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
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setLoading(false);
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <div className="contact-page">
            <div className="container">
                <header className="contact-header">
                    <h1>💬 Contactez-nous</h1>
                    <p className="contact-subtitle">
                        Notre équipe est à votre écoute pour répondre à toutes vos questions
                        et vous accompagner dans votre projet immobilier.
                    </p>
                </header>

                <div className="contact-grid">
                    <div className="contact-form-section">
                        <div className="card">
                            <h2>Envoyez-nous un message</h2>
                            {submitted && (
                                <div className="success-message">
                                    ✅ Votre message a été envoyé avec succès ! Nous vous répondrons dans les meilleurs délais.
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
                                        <option value="taux">Informations sur les taux</option>
                                        <option value="technique">Problème technique</option>
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
                                    ></textarea>
                                </div>

                                <Button type="submit" variant="primary" className="full-width" isLoading={loading}>
                                    {loading ? 'Envoi...' : 'Envoyer le message'}
                                </Button>
                            </form>
                        </div>

                        <div className="contact-info-box">
                            <h3>⏱️ Délai de réponse</h3>
                            <p>Nous nous engageons à répondre à votre demande sous <strong>{companyInfo.responseTime.email}</strong>.</p>
                            <p>Pour les demandes urgentes, privilégiez le contact téléphonique.</p>
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
                                    <small>Réponse sous {companyInfo.responseTime.email}</small>
                                </div>
                            </div>

                            <div className="contact-method">
                                <div className="method-icon">📱</div>
                                <div className="method-content">
                                    <h4>Téléphone</h4>
                                    <p><a href={`tel:${companyInfo.phone}`}>{companyInfo.phone}</a></p>
                                    <small>{companyInfo.supportHours.weekdays}</small>
                                </div>
                            </div>

                            <div className="contact-method">
                                <div className="method-icon">📍</div>
                                <div className="method-content">
                                    <h4>Adresse</h4>
                                    <p>{companyInfo.address}</p>
                                </div>
                            </div>

                            <div className="contact-method">
                                <div className="method-icon">🕐</div>
                                <div className="method-content">
                                    <h4>Horaires d'ouverture</h4>
                                    <p>{companyInfo.supportHours.weekdays}</p>
                                    <p>{companyInfo.supportHours.weekend}</p>
                                    <p>{companyInfo.supportHours.closed}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card faq-suggestion">
                            <h3>❓ Consultez notre FAQ</h3>
                            <p>Vous trouverez peut-être une réponse immédiate à votre question.</p>
                            <Link to="/faq">
                                <Button variant="secondary" className="full-width">Voir la FAQ</Button>
                            </Link>
                        </div>

                        <div className="card simulator-cta">
                            <h3>🧮 Faites une simulation</h3>
                            <p>Estimez votre capacité d'emprunt en quelques clics.</p>
                            <Link to="/simulator">
                                <Button variant="primary" className="full-width">Simuler mon crédit</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .contact-page {
                    min-height: 100vh;
                    background: var(--color-bg);
                    padding: 4rem 0;
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

                .contact-header h1 {
                    font-size: 2.5rem;
                    color: var(--color-primary);
                    margin-bottom: 1rem;
                }

                .contact-subtitle {
                    font-size: 1.1rem;
                    color: var(--color-text-secondary);
                    max-width: 600px;
                    margin: 0 auto;
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

                .card h2 {
                    margin: 0 0 1.5rem;
                    color: var(--color-text);
                }

                .card h3 {
                    margin: 0 0 1rem;
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
                    transition: border-color 0.2s, box-shadow 0.2s;
                }

                .form-input:focus {
                    outline: none;
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
                }

                textarea.form-input {
                    resize: vertical;
                    min-height: 120px;
                }

                .full-width {
                    width: 100%;
                }

                .contact-info-box {
                    background: #f8fafc;
                    padding: 1.5rem;
                    border-radius: var(--radius-lg);
                    border-left: 4px solid var(--color-secondary);
                }

                .contact-info-box h3 {
                    margin: 0 0 0.5rem;
                    color: var(--color-text);
                }

                .contact-info-box p {
                    margin: 0.5rem 0;
                    color: var(--color-text-secondary);
                }

                .contact-details h2 {
                    margin-bottom: 1.5rem;
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
                    width: 40px;
                    text-align: center;
                }

                .method-content h4 {
                    margin: 0 0 0.25rem;
                    color: var(--color-text);
                    font-size: 0.9rem;
                }

                .method-content p {
                    margin: 0;
                    color: var(--color-text-secondary);
                }

                .method-content a {
                    color: var(--color-primary);
                    text-decoration: none;
                }

                .method-content a:hover {
                    text-decoration: underline;
                }

                .method-content small {
                    display: block;
                    font-size: 0.8rem;
                    color: var(--color-text-tertiary);
                    margin-top: 0.25rem;
                }

                .faq-suggestion p,
                .simulator-cta p {
                    color: var(--color-text-secondary);
                    margin-bottom: 1rem;
                }

                @media (max-width: 900px) {
                    .contact-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default Contact;
