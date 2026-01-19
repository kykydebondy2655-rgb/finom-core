import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  motion, 
  AnimatePresence, 
  fadeInUp, 
  staggerContainer
} from '@/components/animations';
import { useAuth } from '../context/AuthContext';
import { registerSchema, RegisterFormData } from '@/lib/validations/authSchemas';
import Button from '../components/finom/Button';
import { AlertTriangle, Lock, Check } from 'lucide-react';

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
            <motion.div 
                className="auth-container-finom auth-container-wide"
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
                        <h1>Créer mon compte</h1>
                        <p>Rejoignez FINOM et gérez vos projets de financement</p>
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
                                <span className="error-icon"><AlertTriangle size={16} /></span>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.form 
                        onSubmit={handleSubmit} 
                        className="auth-form-finom"
                        variants={staggerContainer}
                    >
                        <motion.div 
                            className="form-row-finom"
                            variants={fadeInUp}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="form-group-finom">
                                <label>Prénom</label>
                                <motion.input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={`input-finom ${fieldErrors.firstName ? 'input-error' : ''}`}
                                    placeholder="Jean"
                                    whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(254, 66, 180, 0.15)' }}
                                    transition={{ duration: 0.2 }}
                                />
                                <AnimatePresence>
                                    {fieldErrors.firstName && (
                                        <motion.span 
                                            className="field-error-finom"
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                        >
                                            {fieldErrors.firstName}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="form-group-finom">
                                <label>Nom</label>
                                <motion.input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={`input-finom ${fieldErrors.lastName ? 'input-error' : ''}`}
                                    placeholder="Dupont"
                                    whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(254, 66, 180, 0.15)' }}
                                    transition={{ duration: 0.2 }}
                                />
                                <AnimatePresence>
                                    {fieldErrors.lastName && (
                                        <motion.span 
                                            className="field-error-finom"
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                        >
                                            {fieldErrors.lastName}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="form-group-finom"
                            variants={fadeInUp}
                            transition={{ duration: 0.4 }}
                        >
                            <label>Email</label>
                            <motion.input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`input-finom ${fieldErrors.email ? 'input-error' : ''}`}
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
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`input-finom ${fieldErrors.password ? 'input-error' : ''}`}
                                placeholder="Minimum 6 caractères"
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
                            className="form-group-finom"
                            variants={fadeInUp}
                            transition={{ duration: 0.4 }}
                        >
                            <label>Confirmer le mot de passe</label>
                            <motion.input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`input-finom ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                                placeholder="••••••••"
                                whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(254, 66, 180, 0.15)' }}
                                transition={{ duration: 0.2 }}
                            />
                            <AnimatePresence>
                                {fieldErrors.confirmPassword && (
                                    <motion.span 
                                        className="field-error-finom"
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                    >
                                        {fieldErrors.confirmPassword}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <motion.div
                            variants={fadeInUp}
                            transition={{ duration: 0.4 }}
                        >
                            <Button type="submit" isLoading={loading} variant="primary" className="btn-full-width">
                                {loading ? 'Création...' : 'Créer mon compte'}
                            </Button>
                        </motion.div>

                        <motion.p 
                            className="terms-notice"
                            variants={fadeInUp}
                            transition={{ duration: 0.4 }}
                        >
                            En créant un compte, vous acceptez nos{' '}
                            <Link to="/terms">conditions générales</Link> et notre{' '}
                            <Link to="/privacy">politique de confidentialité</Link>.
                        </motion.p>
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
                        Déjà un compte ?{' '}
                        <Link to="/login" state={{ from: location.state?.from }} className="link-accent">
                            Se connecter
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
                        <Lock size={14} className="trust-icon" /> Inscription sécurisée
                    </motion.span>
                    <motion.span 
                        className="trust-item"
                        whileHover={{ scale: 1.05 }}
                    >
                        <Check size={14} className="trust-icon" /> Conforme RGPD
                    </motion.span>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Register;
