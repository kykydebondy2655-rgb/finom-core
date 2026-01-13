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

    // Get redirect destination from state
    const from = location.state?.from?.pathname;

    // Redirect if already authenticated
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
        
        // Prevent double-submission
        if (loading) return;
        
        setError('');
        setFieldErrors({});

        // Validation Zod
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
            // After successful registration, redirect to the intended page or dashboard
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
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <h1 className="auth-title">Créer mon espace client</h1>
                    <p className="auth-subtitle">Accédez à votre espace personnel pour suivre votre demande de crédit</p>

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
                                    className={`form-input ${fieldErrors.firstName ? 'input-error' : ''}`}
                                />
                                {fieldErrors.firstName && (
                                    <span className="field-error">{fieldErrors.firstName}</span>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Nom *</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={`form-input ${fieldErrors.lastName ? 'input-error' : ''}`}
                                />
                                {fieldErrors.lastName && (
                                    <span className="field-error">{fieldErrors.lastName}</span>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
                                placeholder="votre@email.com"
                            />
                            {fieldErrors.email && (
                                <span className="field-error">{fieldErrors.email}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Mot de passe *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
                                placeholder="Minimum 6 caractères"
                            />
                            {fieldErrors.password && (
                                <span className="field-error">{fieldErrors.password}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Confirmer le mot de passe *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`form-input ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                            />
                            {fieldErrors.confirmPassword && (
                                <span className="field-error">{fieldErrors.confirmPassword}</span>
                            )}
                        </div>

                        <Button type="submit" isLoading={loading} variant="primary" className="full-width">
                            {loading ? 'Création...' : 'Créer mon espace client'}
                        </Button>

                    </form>

                    <p className="auth-footer">
                        Déjà un compte ? <Link to="/login" state={{ from: location.state?.from }}>Se connecter</Link>
                    </p>
                </div>
            </div>

        </div>
    );
};

export default Register;
