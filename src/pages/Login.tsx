import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/finom/Button';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userData = await login(formData.email, formData.password);

            const pendingSim = localStorage.getItem('pendingSimulation');
            if (pendingSim) {
                const data = JSON.parse(pendingSim);
                localStorage.removeItem('pendingSimulation');
                navigate('/loans/new', { state: data });
            } else {
                // Role-based redirect
                if (userData?.role === 'admin') {
                    navigate('/admin');
                } else if (userData?.role === 'agent') {
                    navigate('/agent/callcenter');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err: any) {
            setError(err?.message || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <h1 className="auth-title">Connexion</h1>
                    <p className="auth-subtitle">Accédez à votre espace FINOM</p>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="form-input"
                                autoComplete="off"
                            />
                        </div>

                        <div className="form-group">
                            <label>Mot de passe</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="form-input"
                                autoComplete="new-password"
                            />
                        </div>

                        <Button type="submit" isLoading={loading} variant="primary" className="full-width">
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </Button>

                    </form>

                    <p className="auth-footer">
                        Pas encore de compte ? <Link to="/register">Créer un compte</Link>
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
                    max-width: 450px;
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

                @media (max-width: 480px) {
                    .auth-card {
                        padding: 2rem;
                    }
                    .auth-page {
                        padding: 1rem;
                    }
                    .auth-title {
                        font-size: 1.75rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
