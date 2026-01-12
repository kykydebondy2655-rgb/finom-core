import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations/authSchemas';
import { logger } from '@/lib/logger';
import Button from '@/components/finom/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validation Zod
    const formData: ForgotPasswordFormData = { email };
    const result = forgotPasswordSchema.safeParse(formData);

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
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        result.data.email,
        { redirectTo: redirectUrl }
      );

      if (resetError) {
        logger.error('Password reset request failed', { error: resetError.message });
        setError(resetError.message);
      } else {
        setSuccess(true);
        logger.info('Password reset email sent', { email: result.data.email });
      }
    } catch (err) {
      logger.logError('Password reset error', err);
      setError('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card auth-card-centered">
            <div className="success-icon">✓</div>
            <h1 className="auth-title">Email envoyé !</h1>
            <p className="auth-subtitle">
              Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe.
            </p>
            <p className="auth-subtitle auth-subtitle-spaced">
              Vérifiez également vos spams si vous ne voyez pas l'email.
            </p>
            <Link to="/login">
              <Button variant="primary" className="full-width mt-8">
                Retour à la connexion
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
          <h1 className="auth-title">Mot de passe oublié</h1>
          <p className="auth-subtitle">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
                autoComplete="off"
                placeholder="votre@email.com"
              />
              {fieldErrors.email && (
                <span className="field-error">{fieldErrors.email}</span>
              )}
            </div>

            <Button type="submit" isLoading={loading} variant="primary" className="full-width">
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </Button>
          </form>

          <p className="auth-footer">
            <Link to="/login">← Retour à la connexion</Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default ForgotPassword;
