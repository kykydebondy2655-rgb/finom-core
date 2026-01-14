import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/finom/Card';
import Button from '../components/finom/Button';
import { useToast } from '@/components/finom/Toast';
import { logger } from '@/lib/logger';
import { isStrongPassword } from '@/lib/validators';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'France'
    });
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const [kycStatus, setKycStatus] = useState<string>('pending');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || ''
            }));
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        if (!user?.id) return;
        
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (data) {
            setFormData(prev => ({
                ...prev,
                phone: data.phone || '',
                address: data.address || '',
                city: (data as any).city || '',
                postalCode: (data as any).postal_code || '',
                country: (data as any).country || 'France'
            }));
            setKycStatus(data.kyc_status || 'pending');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        setPasswordErrors([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id || loading) return;

        if (formData.firstName.trim().length < 1) {
            toast.error('Le prénom est requis');
            return;
        }
        if (formData.lastName.trim().length < 1) {
            toast.error('Le nom est requis');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: formData.firstName.trim(),
                    last_name: formData.lastName.trim(),
                    phone: formData.phone.trim() || null,
                    address: formData.address.trim() || null,
                    city: formData.city.trim() || null,
                    postal_code: formData.postalCode.trim() || null,
                    country: formData.country.trim() || 'France'
                } as any)
                .eq('id', user.id);

            if (error) {
                logger.error('Profile update failed', { error: error.message });
                toast.error('Erreur lors de la mise à jour du profil');
                return;
            }

            setSaved(true);
            toast.success('Profil mis à jour avec succès');
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            logger.logError('Profile update error', err);
            toast.error('Une erreur inattendue est survenue');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordLoading) return;

        const errors: string[] = [];

        // Validate password strength
        const strengthCheck = isStrongPassword(passwordData.newPassword);
        if (!strengthCheck.valid) {
            errors.push(...strengthCheck.errors);
        }

        // Check passwords match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.push('Les mots de passe ne correspondent pas');
        }

        if (errors.length > 0) {
            setPasswordErrors(errors);
            return;
        }

        setPasswordLoading(true);
        setPasswordErrors([]);

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (error) {
                logger.error('Password update failed', { error: error.message });
                toast.error(error.message || 'Erreur lors du changement de mot de passe');
                return;
            }

            toast.success('Mot de passe modifié avec succès');
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (err) {
            logger.logError('Password update error', err);
            toast.error('Une erreur inattendue est survenue');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (!user) {
        return (
            <PageLayout>
                <div className="profile-page">
                    <div className="container">
                        <Card padding="xl">
                            <h2>Vous devez être connecté</h2>
                            <p>Veuillez vous connecter pour accéder à votre profil.</p>
                            <Button onClick={() => navigate('/login')} variant="primary">
                                Se connecter
                            </Button>
                        </Card>
                    </div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="profile-page">
                <div className="container">
                    <header className="profile-header">
                        <h1>👤 Mon Profil</h1>
                        <p>Gérez vos informations personnelles et vos préférences de sécurité.</p>
                    </header>

                    <div className="profile-grid">
                        {/* Personal Information Card */}
                        <Card className="profile-card" padding="xl">
                            <h2>Informations personnelles</h2>

                            {saved && (
                                <div className="success-message">
                                    ✅ Vos modifications ont été enregistrées avec succès !
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Prénom *</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Nom *</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        className="form-input disabled"
                                        disabled
                                    />
                                    <small>L'email ne peut pas être modifié</small>
                                </div>

                                <div className="form-group">
                                    <label>Téléphone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="+33 6 12 34 56 78"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Adresse</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Numéro et nom de rue"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Ville</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Paris"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Code postal</label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="75001"
                                            maxLength={10}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Pays</label>
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className="form-input"
                                    >
                                        <option value="France">France</option>
                                        <option value="Belgique">Belgique</option>
                                        <option value="Suisse">Suisse</option>
                                        <option value="Luxembourg">Luxembourg</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>

                                <Button type="submit" variant="primary" isLoading={loading} disabled={loading}>
                                    {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                </Button>
                            </form>
                        </Card>

                        {/* Security Card */}
                        <Card className="profile-card security-card" padding="xl">
                            <h2>🔒 Sécurité</h2>
                            <p className="security-subtitle">Modifiez votre mot de passe</p>

                            <form onSubmit={handlePasswordSubmit}>
                                <div className="form-group">
                                    <label>Nouveau mot de passe *</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className="form-input"
                                        placeholder="Minimum 8 caractères"
                                        minLength={8}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Confirmer le mot de passe *</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="form-input"
                                        placeholder="Répétez le mot de passe"
                                        required
                                    />
                                </div>

                                {passwordErrors.length > 0 && (
                                    <div className="password-errors">
                                        {passwordErrors.map((err, i) => (
                                            <p key={i} className="error-text">⚠️ {err}</p>
                                        ))}
                                    </div>
                                )}

                                <div className="password-requirements">
                                    <p>Le mot de passe doit contenir :</p>
                                    <ul>
                                        <li>Au moins 8 caractères</li>
                                        <li>Au moins une majuscule</li>
                                        <li>Au moins une minuscule</li>
                                        <li>Au moins un chiffre</li>
                                    </ul>
                                </div>

                                <Button 
                                    type="submit" 
                                    variant="secondary" 
                                    isLoading={passwordLoading} 
                                    disabled={passwordLoading || !passwordData.newPassword || !passwordData.confirmPassword}
                                >
                                    {passwordLoading ? 'Modification...' : 'Changer mon mot de passe'}
                                </Button>
                            </form>
                        </Card>

                        {/* Sidebar */}
                        <div className="profile-sidebar">
                            <Card padding="lg">
                                <div className="user-info">
                                    <div className="avatar">
                                        {(formData.firstName?.[0] || 'U').toUpperCase()}
                                    </div>
                                    <h3>{formData.firstName} {formData.lastName}</h3>
                                    <p>{formData.email}</p>
                                    <span className="role-badge">{user.role}</span>
                                </div>
                            </Card>

                            <Card padding="lg">
                                <h3>📊 Statut KYC</h3>
                                <div className="kyc-status">
                                    <span className={`kyc-badge ${kycStatus === 'validated' ? 'validated' : kycStatus === 'rejected' ? 'rejected' : 'pending'}`}>
                                        {kycStatus === 'validated' ? 'Validé' : kycStatus === 'rejected' ? 'Refusé' : 'En attente'}
                                    </span>
                                    <p>
                                        {kycStatus === 'validated' 
                                            ? 'Votre identité a été vérifiée.' 
                                            : kycStatus === 'rejected'
                                            ? 'Veuillez soumettre de nouveaux documents.'
                                            : 'Complétez votre profil et uploadez vos documents.'}
                                    </p>
                                </div>
                            </Card>

                            <Button onClick={handleLogout} variant="danger" className="full-width">
                                Se déconnecter
                            </Button>
                        </div>
                    </div>
                </div>

                <style>{`
                    .profile-page { min-height: 100vh; background: var(--color-bg); padding-bottom: 4rem; }
                    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
                    .profile-header { text-align: center; padding: 3rem 0 2rem; }
                    .profile-header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
                    .profile-header p { color: var(--color-text-secondary); }
                    
                    .profile-grid { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr 280px; 
                        gap: 1.5rem; 
                        align-items: start; 
                    }
                    
                    @media (max-width: 1024px) {
                        .profile-grid { grid-template-columns: 1fr 1fr; }
                        .profile-sidebar { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
                    }
                    
                    @media (max-width: 640px) {
                        .profile-grid { grid-template-columns: 1fr; }
                        .profile-sidebar { display: flex; flex-direction: column; }
                    }
                    
                    .profile-card h2 { font-size: 1.25rem; margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--color-border); }
                    .security-subtitle { color: var(--color-text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem; }
                    
                    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                    @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
                    
                    .form-group { margin-bottom: 1.25rem; }
                    .form-group label { display: block; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem; }
                    .form-group small { color: var(--color-text-tertiary); font-size: 0.8rem; margin-top: 0.25rem; display: block; }
                    
                    .form-input { 
                        width: 100%; 
                        padding: 0.75rem 1rem; 
                        border: 1px solid var(--color-border); 
                        border-radius: 8px; 
                        font-size: 1rem;
                        transition: border-color 0.2s, box-shadow 0.2s;
                    }
                    .form-input:focus { 
                        outline: none; 
                        border-color: var(--color-primary); 
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); 
                    }
                    .form-input.disabled { background: var(--color-bg-secondary); color: var(--color-text-tertiary); cursor: not-allowed; }
                    
                    .success-message { 
                        background: #dcfce7; 
                        color: #166534; 
                        padding: 1rem; 
                        border-radius: 8px; 
                        margin-bottom: 1.5rem; 
                        font-weight: 500; 
                    }
                    
                    .password-errors { 
                        background: #fef2f2; 
                        border: 1px solid #fecaca; 
                        border-radius: 8px; 
                        padding: 0.75rem 1rem; 
                        margin-bottom: 1rem; 
                    }
                    .error-text { color: #dc2626; margin: 0.25rem 0; font-size: 0.9rem; }
                    
                    .password-requirements { 
                        background: var(--color-bg-secondary); 
                        border-radius: 8px; 
                        padding: 1rem; 
                        margin-bottom: 1.5rem; 
                        font-size: 0.85rem; 
                    }
                    .password-requirements p { font-weight: 500; margin-bottom: 0.5rem; }
                    .password-requirements ul { margin: 0; padding-left: 1.25rem; color: var(--color-text-secondary); }
                    .password-requirements li { margin: 0.25rem 0; }
                    
                    .profile-sidebar { display: flex; flex-direction: column; gap: 1rem; }
                    
                    .user-info { text-align: center; }
                    .avatar { 
                        width: 72px; 
                        height: 72px; 
                        border-radius: 50%; 
                        background: var(--color-primary); 
                        color: white; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        font-size: 1.75rem; 
                        font-weight: 700; 
                        margin: 0 auto 1rem; 
                    }
                    .user-info h3 { margin-bottom: 0.25rem; }
                    .user-info p { color: var(--color-text-secondary); font-size: 0.9rem; margin-bottom: 0.75rem; }
                    .role-badge { 
                        display: inline-block; 
                        padding: 0.25rem 0.75rem; 
                        background: var(--color-primary); 
                        color: white; 
                        border-radius: 12px; 
                        font-size: 0.8rem; 
                        text-transform: capitalize; 
                    }
                    
                    .kyc-status { margin-top: 0.75rem; }
                    .kyc-badge { 
                        display: inline-block; 
                        padding: 0.25rem 0.75rem; 
                        border-radius: 12px; 
                        font-size: 0.8rem; 
                        font-weight: 500; 
                    }
                    .kyc-badge.validated { background: #dcfce7; color: #166534; }
                    .kyc-badge.rejected { background: #fef2f2; color: #dc2626; }
                    .kyc-badge.pending { background: #fef9c3; color: #854d0e; }
                    .kyc-status p { color: var(--color-text-secondary); font-size: 0.85rem; margin-top: 0.5rem; }
                    
                    .full-width { width: 100%; }
                `}</style>
            </div>
        </PageLayout>
    );
};

export default Profile;