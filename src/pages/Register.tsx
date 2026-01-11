import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/finom/Button';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate required fields
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setError('Le prénom et le nom sont obligatoires');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);

        try {
            await register(formData.email, formData.password, formData.firstName, formData.lastName);

            const pendingSim = localStorage.getItem('pendingSimulation');
            if (pendingSim) {
                const data = JSON.parse(pendingSim);
                localStorage.removeItem('pendingSimulation');
                navigate('/loans/new', { state: data });
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err?.message || 'Erreur lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <h1 className="auth-title">Créer un compte</h1>
                    <p className="auth-subtitle">Rejoignez FINOM dès aujourd'hui</p>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Prénom *</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Nom *</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Mot de passe *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirmer le mot de passe *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <Button type="submit" isLoading={loading} variant="primary" className="full-width">
                            {loading ? 'Inscription...' : 'Créer mon compte'}
                        </Button>

                    </form>

                    <p className="auth-footer">
                        Déjà un compte ? <Link to="/login">Se connecter</Link>
                    </p>
                </div>
            </div>

            <style>{`
                .auth-page {
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: linear-gradient(135deg, var(--color-bg) 0%, #e0e5ec 100%);
                    padding: 2rem;
                }

                .auth-container {
                    width: 100%;
                    max-width: 500px;
                }

                .auth-card {
                    background: white;
                    padding: 3rem;
                    border-radius: var(--radius-lg);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                }

                .auth-title {
                    text-align: center;
                    margin-bottom: 0.5rem;
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--color-primary);
                    line-height: 1.2;
                }

                .auth-subtitle {
                    text-align: center;
                    color: #666;
                    margin-bottom: 2rem;
                }

                .error-message {
                    background-color: #fee;
                    color: var(--color-danger);
                    padding: 0.75rem;
                    border-radius: var(--radius-md);
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                }

                .auth-footer {
                    text-align: center;
                    margin-top: 1.5rem;
                    color: #666;
                }

                .auth-footer a {
                    color: var(--color-primary);
                    font-weight: 500;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                @media (max-width: 500px) {
                    .auth-card {
                        padding: 2rem;
                    }
                    .auth-page {
                        padding: 1rem;
                    }
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default Register;
