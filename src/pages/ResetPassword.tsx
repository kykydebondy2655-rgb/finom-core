import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { resetPasswordSchema } from '@/lib/validations/authSchemas';
import { logger } from '@/lib/logger';
import Button from '@/components/finom/Button';
import { CheckCircle2, XCircle } from 'lucide-react';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
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
          <div className="auth-card auth-card-centered">
            <p>Vérification en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid session
  if (!isValidSession) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card auth-card-centered">
            <div className="error-icon"><XCircle size={32} /></div>
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
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card auth-card-centered">
            <div className="success-icon"><CheckCircle2 size={32} /></div>
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
    </div>
  );
};

export default ResetPassword;
