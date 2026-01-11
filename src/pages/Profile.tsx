import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Card from '../components/finom/Card';
import Button from '../components/finom/Button';

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
        
        const { data, error } = await supabase
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

        const { error } = await supabase
            .from('profiles')
            .update({
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone: formData.phone,
                address: formData.address
            })
            .eq('id', user.id);

        setLoading(false);

        if (!error) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (!user) {
        return (
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
        );
    }

    return (
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
                                <span className="kyc-badge pending">En attente</span>
                                <p>Complétez votre profil et uploadez vos documents pour vérification.</p>
                            </div>
                        </Card>

                        <Card padding="lg">
                            <h3>🔐 Sécurité</h3>
                            <Button variant="ghost" className="full-width" disabled>
                                Changer le mot de passe
                            </Button>
                        </Card>

                        <Button onClick={handleLogout} variant="danger" className="full-width">
                            Se déconnecter
                        </Button>
                    </div>
                </div>
            </div>

            <style>{`
                .profile-page {
                    min-height: 100vh;
                    background: var(--color-bg);
                    padding: 4rem 0;
                }

                .container {
                    max-width: 1100px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }

                .profile-header {
                    margin-bottom: 2rem;
                }

                .profile-header h1 {
                    font-size: 2rem;
                    color: var(--color-primary);
                    margin-bottom: 0.5rem;
                }

                .profile-header p {
                    color: var(--color-text-secondary);
                }

                .profile-grid {
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: 2rem;
                    align-items: start;
                }

                .profile-card h2 {
                    margin: 0 0 1.5rem;
                    color: var(--color-text);
                }

                .success-message {
                    background: #d4edda;
                    color: #155724;
                    padding: 1rem;
                    border-radius: var(--radius-md);
                    margin-bottom: 1.5rem;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: var(--color-text);
                }

                .form-input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    font-size: 1rem;
                    transition: border-color 0.2s;
                }

                .form-input:focus {
                    outline: none;
                    border-color: var(--color-primary);
                }

                .form-input:disabled {
                    background: #f8fafc;
                    color: var(--color-text-tertiary);
                }

                .form-group small {
                    display: block;
                    margin-top: 0.25rem;
                    font-size: 0.8rem;
                    color: var(--color-text-tertiary);
                }

                .profile-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .profile-sidebar h3 {
                    margin: 0 0 1rem;
                    font-size: 1rem;
                    color: var(--color-text);
                }

                .user-info {
                    text-align: center;
                }

                .avatar {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
                    color: white;
                    font-size: 2rem;
                    font-weight: 700;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1rem;
                }

                .user-info h3 {
                    margin: 0 0 0.25rem;
                }

                .user-info p {
                    margin: 0 0 0.5rem;
                    color: var(--color-text-secondary);
                    font-size: 0.9rem;
                }

                .role-badge {
                    display: inline-block;
                    background: var(--color-secondary);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .kyc-status {
                    text-align: center;
                }

                .kyc-badge {
                    display: inline-block;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    margin-bottom: 0.5rem;
                }

                .kyc-badge.pending {
                    background: #fff3cd;
                    color: #856404;
                }

                .kyc-badge.verified {
                    background: #d4edda;
                    color: #155724;
                }

                .kyc-status p {
                    font-size: 0.85rem;
                    color: var(--color-text-secondary);
                    margin: 0;
                }

                .full-width {
                    width: 100%;
                }

                @media (max-width: 900px) {
                    .profile-grid {
                        grid-template-columns: 1fr;
                    }
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default Profile;
