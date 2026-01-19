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
import { useExportProfile } from '@/hooks/useExportProfile';
import { User, Lock, BarChart3, Download, LogOut } from 'lucide-react';

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
    const { exportData, exporting } = useExportProfile(user?.id);

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

    const handleExport = async () => {
        try {
            await exportData();
            toast.success('Vos données ont été exportées avec succès');
        } catch {
            toast.error('Erreur lors de l\'export des données');
        }
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
                        <h1 className="sidebar-card-title"><User size={28} />Mon Profil</h1>
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
                            <h2 className="sidebar-card-title"><Lock size={20} />Sécurité</h2>
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
                                <h3 className="sidebar-card-title"><BarChart3 size={18} />Statut KYC</h3>
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

                            <Card padding="lg">
                                <h3 className="sidebar-card-title"><Download size={18} />Mes données (RGPD)</h3>
                                <p className="rgpd-text">
                                    Téléchargez l'ensemble de vos données personnelles au format JSON.
                                </p>
                                <Button 
                                    onClick={handleExport} 
                                    variant="secondary" 
                                    size="sm"
                                    isLoading={exporting}
                                    disabled={exporting}
                                    className="full-width btn-icon-text"
                                >
                                    <Download size={16} />
                                    Exporter mes données
                                </Button>
                            </Card>

                            <Button onClick={handleLogout} variant="danger" className="full-width btn-icon-text">
                                <LogOut size={18} />
                                Se déconnecter
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default Profile;