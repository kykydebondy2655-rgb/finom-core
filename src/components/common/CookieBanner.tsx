import React, { useState, useEffect } from 'react';

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag: (command: string, action: string, params?: Record<string, string>) => void;
  }
}

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Petit délai pour ne pas apparaître immédiatement
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const updateGoogleConsent = (granted: boolean) => {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        'ad_storage': granted ? 'granted' : 'denied',
        'ad_user_data': granted ? 'granted' : 'denied',
        'ad_personalization': granted ? 'granted' : 'denied',
        'analytics_storage': granted ? 'granted' : 'denied',
        'personalization_storage': granted ? 'granted' : 'denied'
      });
    }
  };

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    updateGoogleConsent(true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    updateGoogleConsent(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-banner-content">
        <p className="cookie-banner-text">
          Nous utilisons des cookies pour améliorer votre expérience et mesurer l'audience.{' '}
          <a href="/privacy" className="cookie-banner-link">En savoir plus</a>
        </p>
        <div className="cookie-banner-actions">
          <button onClick={handleDecline} className="cookie-btn-decline">
            Refuser
          </button>
          <button onClick={handleAccept} className="cookie-btn-accept">
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
