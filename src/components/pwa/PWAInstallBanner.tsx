import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const DISMISS_KEY = 'pwa-banner-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, canPrompt, promptInstall, isIOS } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Check if banner was dismissed recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        return; // Still within dismiss period
      }
    }

    // Show banner if on mobile, not installed, and can prompt (or iOS)
    if (isMobile && !isInstalled && (canPrompt || isIOS)) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, isInstalled, canPrompt, isIOS]);

  const handleInstall = async () => {
    if (isIOS) {
      // Redirect to install page for iOS instructions
      window.location.href = '/install';
      return;
    }

    const success = await promptInstall();
    if (success) {
      toast.success('Application installée avec succès !');
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden"
        >
          <div className="bg-card border border-border rounded-2xl shadow-xl p-4 mx-auto max-w-md backdrop-blur-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-primary-foreground" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">
                  Installer FINOM
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Accédez rapidement à votre compte depuis l'écran d'accueil
                </p>
                
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleInstall}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {isIOS ? 'Voir comment' : 'Installer'}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-2 text-muted-foreground text-xs hover:text-foreground transition-colors"
                  >
                    Plus tard
                  </button>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallBanner;
