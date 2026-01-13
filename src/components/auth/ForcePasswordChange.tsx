import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/finom/Button';
import logger from '@/lib/logger';

export interface ForcePasswordChangeProps {
  onSuccess: () => void;
}

const ForcePasswordChange: React.FC<ForcePasswordChangeProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre');
      return;
    }

    setLoading(true);
    try {
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      // Mark password as changed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', user.id);

      if (profileError) throw profileError;

      onSuccess();
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe';
      logger.logError('Error changing password', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="force-password-change">
      <div className="change-card">
        <div className="card-header">
          <div className="lock-icon">🔐</div>
          <h1>Changement de mot de passe requis</h1>
          <p>Pour des raisons de sécurité, vous devez définir un nouveau mot de passe avant de continuer.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="currentPassword">Mot de passe actuel</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="Entrez votre mot de passe actuel"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">Nouveau mot de passe</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Minimum 8 caractères"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Répétez le nouveau mot de passe"
            />
          </div>

          <div className="password-requirements">
            <p>Le mot de passe doit contenir :</p>
            <ul>
              <li className={newPassword.length >= 8 ? 'valid' : ''}>Au moins 8 caractères</li>
              <li className={/[A-Z]/.test(newPassword) ? 'valid' : ''}>Une lettre majuscule</li>
              <li className={/[a-z]/.test(newPassword) ? 'valid' : ''}>Une lettre minuscule</li>
              <li className={/[0-9]/.test(newPassword) ? 'valid' : ''}>Un chiffre</li>
            </ul>
          </div>

          <Button type="submit" variant="primary" disabled={loading} className="full-width-btn">
            {loading ? 'Mise à jour...' : 'Définir mon nouveau mot de passe'}
          </Button>
        </form>
      </div>

      <style>{`
        .force-password-change {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 2rem;
        }
        .change-card {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .card-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .lock-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .card-header h1 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: var(--color-text);
        }
        .card-header p {
          color: var(--color-text-secondary);
          font-size: 0.95rem;
        }
        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-group label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        .form-group input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: var(--color-primary);
        }
        .error-message {
          background: #fef2f2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }
        .password-requirements {
          background: var(--color-muted);
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }
        .password-requirements p {
          margin: 0 0 0.5rem;
          font-weight: 500;
        }
        .password-requirements ul {
          margin: 0;
          padding-left: 1.25rem;
        }
        .password-requirements li {
          color: var(--color-text-tertiary);
          margin: 0.25rem 0;
        }
        .password-requirements li.valid {
          color: #16a34a;
        }
        .password-requirements li.valid::marker {
          content: '✓ ';
        }
        .full-width-btn {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default ForcePasswordChange;