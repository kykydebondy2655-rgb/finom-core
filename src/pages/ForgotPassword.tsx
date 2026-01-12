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
          <div className="auth-card">
            <div className="success-icon">✓</div>
            <h1 className="auth-title">Email envoyé !</h1>
            <p className="auth-subtitle">
              Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe.
            </p>
            <p className="auth-subtitle" style={{ marginTop: '1rem' }}>
              Vérifiez également vos spams si vous ne voyez pas l'email.
            </p>
            <Link to="/login">
              <Button variant="primary" className="full-width mt-8">
                Retour à la connexion
              </Button>
            </Link>
          </div>
        </div>

        <style>{`
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
            text-align: center;
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

          .auth-title {
            margin-bottom: 0.5rem;
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--color-primary);
            line-height: 1.2;
          }

          .auth-subtitle {
            color: #666;
            line-height: 1.5;
          }
        `}</style>
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

      <style>{`
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

        .auth-footer {
          text-align: center;
          margin-top: 1.5rem;
          color: #666;
        }

        .auth-footer a {
          color: var(--color-primary);
          font-weight: 500;
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
      `}</style>
    </div>
  );
};

export default ForgotPassword;
