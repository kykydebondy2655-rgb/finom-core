import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  motion, 
  AnimatePresence, 
  fadeInUp, 
  staggerContainer
} from '@/components/animations';
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
            <motion.div 
                className="auth-container-finom"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
            >
                {/* Logo */}
                <motion.div 
                    className="auth-logo"
                    variants={fadeInUp}
                    transition={{ duration: 0.5 }}
                >
                    <motion.span 
                        className="logo-text"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        FINOM
                    </motion.span>
                </motion.div>

                <motion.div 
                    className="auth-card-finom"
                    variants={fadeInUp}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div 
                        className="auth-header-finom"
                        variants={fadeInUp}
                        transition={{ duration: 0.4 }}
                    >
                        <h1>Connexion</h1>
                        <p>Accédez à votre espace personnel</p>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div 
                                className="auth-error-finom"
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                <span className="error-icon">⚠️</span>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.form 
                        onSubmit={handleSubmit} 
                        autoComplete="off" 
                        className="auth-form-finom"
                        variants={staggerContainer}
                    >
                        <motion.div 
                            className="form-group-finom"
                            variants={fadeInUp}
                            transition={{ duration: 0.4 }}
                        >
                            <label>Email</label>
                            <motion.input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={`input-finom ${fieldErrors.email ? 'input-error' : ''}`}
                                autoComplete="off"
                                placeholder="votre@email.com"
                                whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(254, 66, 180, 0.15)' }}
                                transition={{ duration: 0.2 }}
                            />
                            <AnimatePresence>
                                {fieldErrors.email && (
                                    <motion.span 
                                        className="field-error-finom"
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                    >
                                        {fieldErrors.email}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <motion.div 
                            className="form-group-finom"
                            variants={fadeInUp}
                            transition={{ duration: 0.4 }}
                        >
                            <label>Mot de passe</label>
                            <motion.input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className={`input-finom ${fieldErrors.password ? 'input-error' : ''}`}
                                autoComplete="new-password"
                                placeholder="••••••••"
                                whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(254, 66, 180, 0.15)' }}
                                transition={{ duration: 0.2 }}
                            />
                            <AnimatePresence>
                                {fieldErrors.password && (
                                    <motion.span 
                                        className="field-error-finom"
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                    >
                                        {fieldErrors.password}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <motion.div 
                            className="forgot-link-finom"
                            variants={fadeInUp}
                            transition={{ duration: 0.4 }}
                        >
                            <Link to="/forgot-password">Mot de passe oublié ?</Link>
                        </motion.div>

                        <motion.div
                            variants={fadeInUp}
                            transition={{ duration: 0.4 }}
                        >
                            <Button type="submit" isLoading={loading} variant="primary" className="btn-full-width">
                                {loading ? 'Connexion...' : 'Se connecter'}
                            </Button>
                        </motion.div>
                    </motion.form>

                    <motion.div 
                        className="auth-divider-finom"
                        variants={fadeInUp}
                        transition={{ duration: 0.4 }}
                    >
                        <span>ou</span>
                    </motion.div>

                    <motion.p 
                        className="auth-footer-finom"
                        variants={fadeInUp}
                        transition={{ duration: 0.4 }}
                    >
                        Pas encore de compte ?{' '}
                        <Link to="/register" state={{ from: location.state?.from }} className="link-accent">
                            Créer un compte
                        </Link>
                    </motion.p>
                </motion.div>

                <motion.div 
                    className="auth-trust-finom"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <motion.span 
                        className="trust-item"
                        whileHover={{ scale: 1.05 }}
                    >
                        🔒 Connexion sécurisée
                    </motion.span>
                    <motion.span 
                        className="trust-item"
                        whileHover={{ scale: 1.05 }}
                    >
                        🛡️ Données chiffrées
                    </motion.span>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
