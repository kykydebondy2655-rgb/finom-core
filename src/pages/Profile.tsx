import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/finom/Card';
import Button from '../components/finom/Button';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: ''
    });
    const [kycStatus, setKycStatus] = useState<string>('pending');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: '',
                address: ''
            });
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
                address: data.address || ''
            }));
            setKycStatus(data.kyc_status || 'pending');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        setLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    phone: formData.phone,
                    address: formData.address
                })
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
                        <p>Gérez vos informations personnelles et vos préférences.</p>
                    </header>

                    <div className="profile-grid">
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
                                        <label>Prénom</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Nom</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        className="form-input"
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
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="form-input"
                                        rows={3}
                                        placeholder="Votre adresse complète"
                                    />
                                </div>

                                <Button type="submit" variant="primary" isLoading={loading}>
                                    {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                </Button>
                            </form>
                        </Card>

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

            </div>
        </PageLayout>
    );
};

export default Profile;
