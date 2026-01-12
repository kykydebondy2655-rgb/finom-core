import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/validations/authSchemas';
import { logger } from '@/lib/logger';
import Button from '@/components/finom/Button';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si on a une session de récupération valide
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Si pas de session mais on a un hash avec access_token, c'est OK
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (session || (accessToken && type === 'recovery')) {
        setIsValidSession(true);
      } else {
        setIsValidSession(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validation Zod
    const result = resetPasswordSchema.safeParse(formData);

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
      const { error: updateError } = await supabase.auth.updateUser({
        password: result.data.password
      });

      if (updateError) {
        logger.error('Password update failed', { error: updateError.message });
        setError(updateError.message);
      } else {
        setSuccess(true);
        logger.info('Password updated successfully');
        
        // Rediriger vers login après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      logger.logError('Password update error', err);
      setError('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (isValidSession === null) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <p>Vérification en cours...</p>
          </div>
        </div>
        <style>{baseStyles}</style>
      </div>
    );
  }

  // Invalid session
  if (!isValidSession) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="error-icon">✕</div>
            <h1 className="auth-title">Lien invalide ou expiré</h1>
            <p className="auth-subtitle">
              Ce lien de réinitialisation n'est plus valide. Veuillez faire une nouvelle demande.
            </p>
            <Link to="/forgot-password">
              <Button variant="primary" className="full-width mt-8">
                Nouvelle demande
              </Button>
            </Link>
          </div>
        </div>
        <style>{baseStyles}</style>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="success-icon">✓</div>
            <h1 className="auth-title">Mot de passe modifié !</h1>
            <p className="auth-subtitle">
              Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion...
            </p>
            <Link to="/login">
              <Button variant="primary" className="full-width mt-8">
                Se connecter maintenant
              </Button>
            </Link>
          </div>
        </div>
        <style>{baseStyles}</style>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Nouveau mot de passe</h1>
          <p className="auth-subtitle">
            Choisissez votre nouveau mot de passe
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
                placeholder="Minimum 6 caractères"
              />
              {fieldErrors.password && (
                <span className="field-error">{fieldErrors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`form-input ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Confirmez votre mot de passe"
              />
              {fieldErrors.confirmPassword && (
                <span className="field-error">{fieldErrors.confirmPassword}</span>
              )}
            </div>

            <Button type="submit" isLoading={loading} variant="primary" className="full-width">
              {loading ? 'Modification...' : 'Modifier le mot de passe'}
            </Button>
          </form>
        </div>
      </div>
      <style>{baseStyles}</style>
    </div>
  );
};

const baseStyles = `
  .auth-page {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, var(--color-bg) 0%, #e0e5ec 100%);
    padding: 2rem;
  }

  .auth-container {
    width: 100%;
    max-width: 450px;
  }

  .auth-card {
    background: white;
    padding: 3rem;
    border-radius: var(--radius-lg);
    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  }

  .auth-title {
    text-align: center;
    margin-bottom: 0.5rem;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-primary);
    line-height: 1.2;
  }

  .auth-subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 2rem;
    line-height: 1.5;
  }

  .error-message {
    background-color: #fee;
    color: var(--color-danger);
    padding: 0.75rem;
    border-radius: var(--radius-md);
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  .success-icon {
    width: 60px;
    height: 60px;
    background: var(--color-success, #22c55e);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin: 0 auto 1.5rem;
  }

  .error-icon {
    width: 60px;
    height: 60px;
    background: var(--color-danger, #ef4444);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin: 0 auto 1.5rem;
  }

  .field-error {
    color: var(--color-danger);
    font-size: 0.8rem;
    margin-top: 0.25rem;
    display: block;
  }

  .input-error {
    border-color: var(--color-danger) !important;
  }

  @media (max-width: 480px) {
    .auth-card {
      padding: 2rem;
    }
    .auth-page {
      padding: 1rem;
    }
  }
`;

export default ResetPassword;
