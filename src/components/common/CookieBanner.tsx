import React, { useState, useEffect } from 'react';

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

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-banner-content">
        <p className="cookie-banner-text">
          Nous utilisons des cookies essentiels pour le fonctionnement du site.{' '}
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
