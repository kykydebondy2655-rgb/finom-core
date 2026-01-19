import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/finom/Button';

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
            <div className="contact-page-finom">
                {/* Hero */}
                <section className="contact-hero fade-in">
                    <div className="container">
                        <span className="badge-finom">CONTACT</span>
                        <h1>Nous contacter</h1>
                        <p className="hero-subtitle">
                            Notre équipe est à votre disposition pour toute question relative à votre projet de financement.
                        </p>
                    </div>
                </section>

                <div className="container">
                    <div className="contact-grid-finom">
                        {/* Form */}
                        <div className="contact-form-card fade-in">
                            <h3>Envoyer un message</h3>
                            
                            {submitted && (
                                <div className="success-message-finom">
                                    ✅ Votre message a été envoyé. Un conseiller vous répondra sous 24-48h.
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="contact-form-finom">
                                <div className="form-group-finom">
                                    <label htmlFor="name">Nom complet</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input-finom"
                                        placeholder="Jean Dupont"
                                        required
                                    />
                                </div>
                                <div className="form-group-finom">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input-finom"
                                        placeholder="votre@email.com"
                                        required
                                    />
                                </div>
                                <div className="form-group-finom">
                                    <label htmlFor="subject">Objet</label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="input-finom"
                                        required
                                    >
                                        <option value="">Sélectionnez un sujet</option>
                                        <option value="simulation">Question sur ma simulation</option>
                                        <option value="dossier">Suivi de ma demande</option>
                                        <option value="documents">Documents à fournir</option>
                                        <option value="conditions">Conditions et taux</option>
                                        <option value="autre">Autre demande</option>
                                    </select>
                                </div>
                                <div className="form-group-finom">
                                    <label htmlFor="message">Votre message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="input-finom"
                                        rows={5}
                                        placeholder="Décrivez votre demande..."
                                        required
                                    />
                                </div>
                                <Button type="submit" variant="primary" className="btn-full-width" isLoading={loading}>
                                    {loading ? 'Envoi...' : 'Envoyer le message'}
                                </Button>
                            </form>
                        </div>

                        {/* Info */}
                        <div className="contact-info-finom fade-in" style={{ animationDelay: '150ms' }}>
                            <div className="info-card-finom">
                                <h3>Coordonnées</h3>
                                <div className="contact-method-finom">
                                    <span className="method-icon">📍</span>
                                    <div>
                                        <strong>Adresse</strong>
                                        <p>9 Rue du Quatre Septembre<br />75002 Paris, France</p>
                                    </div>
                                </div>
                                <div className="contact-method-finom">
                                    <span className="method-icon">📞</span>
                                    <div>
                                        <strong>Téléphone</strong>
                                        <p><a href="tel:0187680890">01 87 68 08 90</a></p>
                                    </div>
                                </div>
                                <div className="contact-method-finom">
                                    <span className="method-icon">✉️</span>
                                    <div>
                                        <strong>Email</strong>
                                        <p><a href={`mailto:${companyInfo.email}`}>{companyInfo.email}</a></p>
                                    </div>
                                </div>
                                <div className="hours-finom">
                                    <strong>Horaires d'ouverture</strong>
                                    <p>{companyInfo.supportHours.weekdays}</p>
                                    <p>{companyInfo.supportHours.weekend}</p>
                                </div>
                            </div>

                            <div className="faq-card-finom">
                                <h4>Questions fréquentes</h4>
                                <p>Consultez notre FAQ pour des réponses rapides.</p>
                                <Link to="/faq">
                                    <Button variant="secondary" size="sm" className="btn-full-width">
                                        Accéder à la FAQ
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Domain Banner */}
                <div className="domain-banner-finom">
                    <span className="domain-lock">🔒</span>
                    Vous êtes sur <strong>pret-finom.co</strong> — Site officiel FINOM
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Contact;
