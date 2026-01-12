import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginSchema, LoginFormData } from '@/lib/validations/authSchemas';
import Button from '../components/finom/Button';

const Login = () => {
    const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get redirect destination from state or default based on role
    const from = location.state?.from?.pathname;

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            redirectUser(user.role);
        }
    }, [isAuthenticated, user]);

    const redirectUser = (role: string) => {
        if (from) {
            navigate(from, { replace: true });
        } else if (role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
        } else if (role === 'agent') {
            navigate('/agent/dashboard', { replace: true });
        } else {
            navigate('/dashboard', { replace: true });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        // Validation Zod
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
            const errors: Record<string, string> = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) {
                    errors[err.path[0] as string] = err.message;
                }
            });
            setFieldErrors(errors);
            return;
        }

        setLoading(true);

        try {
            const loggedUser = await login(result.data.email, result.data.password);
            redirectUser(loggedUser.role);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erreur de connexion';
            setError(message);
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
                                className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
                                autoComplete="off"
                                placeholder="votre@email.com"
                            />
                            {fieldErrors.email && (
                                <span className="field-error">{fieldErrors.email}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Mot de passe</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
                                autoComplete="new-password"
                            />
                            {fieldErrors.password && (
                                <span className="field-error">{fieldErrors.password}</span>
                            )}
                        </div>

                        <div className="forgot-password-link">
                            <Link to="/forgot-password">Mot de passe oublié ?</Link>
                        </div>

                        <Button type="submit" isLoading={loading} variant="primary" className="full-width">
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </Button>

                    </form>

                    <p className="auth-footer">
                        Pas encore de compte ? <Link to="/register" state={{ from: location.state?.from }}>Créer un compte</Link>
                    </p>
                </div>
            </div>

        </div>
    );
};

export default Login;
