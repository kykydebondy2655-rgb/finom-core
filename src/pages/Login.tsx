import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginSchema, LoginFormData } from '@/lib/validations/authSchemas';
import Button from '../components/finom/Button';
import ForcePasswordChange from '../components/auth/ForcePasswordChange';

const Login = () => {
    const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const { login, isAuthenticated, user, clearMustChangePassword } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname;

    useEffect(() => {
        if (isAuthenticated && user && !user.mustChangePassword) {
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
            
            if (loggedUser.mustChangePassword) {
                setShowPasswordChange(true);
            } else {
                redirectUser(loggedUser.role);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erreur de connexion';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChangeSuccess = () => {
        setShowPasswordChange(false);
        clearMustChangePassword();
        if (user) {
            redirectUser(user.role);
        }
    };

    if (showPasswordChange && user) {
        return <ForcePasswordChange onSuccess={handlePasswordChangeSuccess} />;
    }

    return (
        <div className="auth-page-finom">
            <div className="auth-container-finom fade-in">
                {/* Logo */}
                <div className="auth-logo">
                    <span className="logo-text">FINOM</span>
                </div>

                <div className="auth-card-finom">
                    <div className="auth-header-finom">
                        <h1>Connexion</h1>
                        <p>Accédez à votre espace personnel</p>
                    </div>

                    {error && (
                        <div className="auth-error-finom fade-in">
                            <span className="error-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} autoComplete="off" className="auth-form-finom">
                        <div className="form-group-finom">
                            <label>Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={`input-finom ${fieldErrors.email ? 'input-error' : ''}`}
                                autoComplete="off"
                                placeholder="votre@email.com"
                            />
                            {fieldErrors.email && (
                                <span className="field-error-finom">{fieldErrors.email}</span>
                            )}
                        </div>

                        <div className="form-group-finom">
                            <label>Mot de passe</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className={`input-finom ${fieldErrors.password ? 'input-error' : ''}`}
                                autoComplete="new-password"
                                placeholder="••••••••"
                            />
                            {fieldErrors.password && (
                                <span className="field-error-finom">{fieldErrors.password}</span>
                            )}
                        </div>

                        <div className="forgot-link-finom">
                            <Link to="/forgot-password">Mot de passe oublié ?</Link>
                        </div>

                        <Button type="submit" isLoading={loading} variant="primary" className="btn-full-width">
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </Button>
                    </form>

                    <div className="auth-divider-finom">
                        <span>ou</span>
                    </div>

                    <p className="auth-footer-finom">
                        Pas encore de compte ?{' '}
                        <Link to="/register" state={{ from: location.state?.from }} className="link-accent">
                            Créer un compte
                        </Link>
                    </p>
                </div>

                <div className="auth-trust-finom">
                    <span className="trust-item">🔒 Connexion sécurisée</span>
                    <span className="trust-item">🛡️ Données chiffrées</span>
                </div>
            </div>
        </div>
    );
};

export default Login;
