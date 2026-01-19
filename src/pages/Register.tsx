import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerSchema, RegisterFormData } from '@/lib/validations/authSchemas';
import Button from '../components/finom/Button';

const Register = () => {
    const [formData, setFormData] = useState<RegisterFormData>({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const { register, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname;

    useEffect(() => {
        if (isAuthenticated && user) {
            if (from) {
                navigate(from, { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [isAuthenticated, user, from, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (loading) return;
        
        setError('');
        setFieldErrors({});

        const result = registerSchema.safeParse(formData);
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
            await register(result.data.email, result.data.password, result.data.firstName, result.data.lastName);
            if (from) {
                navigate(from, { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Erreur lors de l'inscription";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="auth-page-finom">
            <div className="auth-container-finom auth-container-wide fade-in">
                {/* Logo */}
                <div className="auth-logo">
                    <span className="logo-text">FINOM</span>
                </div>

                <div className="auth-card-finom">
                    <div className="auth-header-finom">
                        <h1>Créer mon compte</h1>
                        <p>Rejoignez FINOM et gérez vos projets de financement</p>
                    </div>

                    {error && (
                        <div className="auth-error-finom fade-in">
                            <span className="error-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form-finom">
                        <div className="form-row-finom">
                            <div className="form-group-finom">
                                <label>Prénom</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={`input-finom ${fieldErrors.firstName ? 'input-error' : ''}`}
                                    placeholder="Jean"
                                />
                                {fieldErrors.firstName && (
                                    <span className="field-error-finom">{fieldErrors.firstName}</span>
                                )}
                            </div>
                            <div className="form-group-finom">
                                <label>Nom</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={`input-finom ${fieldErrors.lastName ? 'input-error' : ''}`}
                                    placeholder="Dupont"
                                />
                                {fieldErrors.lastName && (
                                    <span className="field-error-finom">{fieldErrors.lastName}</span>
                                )}
                            </div>
                        </div>

                        <div className="form-group-finom">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`input-finom ${fieldErrors.email ? 'input-error' : ''}`}
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
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`input-finom ${fieldErrors.password ? 'input-error' : ''}`}
                                placeholder="Minimum 6 caractères"
                            />
                            {fieldErrors.password && (
                                <span className="field-error-finom">{fieldErrors.password}</span>
                            )}
                        </div>

                        <div className="form-group-finom">
                            <label>Confirmer le mot de passe</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`input-finom ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                                placeholder="••••••••"
                            />
                            {fieldErrors.confirmPassword && (
                                <span className="field-error-finom">{fieldErrors.confirmPassword}</span>
                            )}
                        </div>

                        <Button type="submit" isLoading={loading} variant="primary" className="btn-full-width">
                            {loading ? 'Création...' : 'Créer mon compte'}
                        </Button>

                        <p className="terms-notice">
                            En créant un compte, vous acceptez nos{' '}
                            <Link to="/terms">conditions générales</Link> et notre{' '}
                            <Link to="/privacy">politique de confidentialité</Link>.
                        </p>
                    </form>

                    <div className="auth-divider-finom">
                        <span>ou</span>
                    </div>

                    <p className="auth-footer-finom">
                        Déjà un compte ?{' '}
                        <Link to="/login" state={{ from: location.state?.from }} className="link-accent">
                            Se connecter
                        </Link>
                    </p>
                </div>

                <div className="auth-trust-finom">
                    <span className="trust-item">🔒 Inscription sécurisée</span>
                    <span className="trust-item">✓ Conforme RGPD</span>
                </div>
            </div>
        </div>
    );
};

export default Register;
