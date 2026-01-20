import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ShieldCheck } from 'lucide-react';

interface LoginLoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const LoginLoadingOverlay: React.FC<LoginLoadingOverlayProps> = ({
  isVisible,
  message = 'Connexion en cours...'
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="login-loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="login-loading-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Animated logo */}
            <motion.div
              className="login-loading-logo"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <span className="logo-text">FINOM</span>
            </motion.div>

            {/* Spinner with icon */}
            <motion.div
              className="login-loading-spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 size={48} strokeWidth={2} />
            </motion.div>

            {/* Message */}
            <motion.p
              className="login-loading-message"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {message}
            </motion.p>

            {/* Security badge */}
            <motion.div
              className="login-loading-badge"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <ShieldCheck size={14} />
              <span>Connexion sécurisée</span>
            </motion.div>
          </motion.div>

          <style>{`
            .login-loading-overlay {
              position: fixed;
              inset: 0;
              background: linear-gradient(180deg, rgba(250, 251, 252, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%);
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 9999;
            }

            .login-loading-content {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 1.5rem;
              padding: 2rem;
              text-align: center;
            }

            .login-loading-logo .logo-text {
              font-size: 2rem;
              font-weight: 900;
              color: hsl(var(--foreground));
              letter-spacing: -0.03em;
            }

            .login-loading-spinner {
              color: hsl(var(--accent));
            }

            .login-loading-message {
              font-size: 1rem;
              font-weight: 500;
              color: hsl(var(--foreground));
              margin: 0;
            }

            .login-loading-badge {
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              background: white;
              padding: 0.5rem 1rem;
              border-radius: 2rem;
              font-size: 0.75rem;
              font-weight: 500;
              color: hsl(var(--muted-foreground));
              border: 1px solid hsl(var(--border));
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            }

            .login-loading-badge svg {
              color: hsl(var(--accent));
            }

            @media (max-width: 480px) {
              .login-loading-logo .logo-text {
                font-size: 1.5rem;
              }

              .login-loading-spinner svg {
                width: 40px;
                height: 40px;
              }

              .login-loading-message {
                font-size: 0.9375rem;
              }

              .login-loading-badge {
                font-size: 0.6875rem;
                padding: 0.375rem 0.75rem;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginLoadingOverlay;
