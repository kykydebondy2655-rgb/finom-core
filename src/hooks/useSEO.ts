import { useEffect } from 'react';

interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
  noIndex?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  structuredData?: object;
}

/**
 * Hook pour gérer les méta-tags SEO dynamiques
 * Aide à prévenir la détection de phishing en fournissant des signaux de confiance clairs
 */
export const useSEO = (config: SEOConfig) => {
  useEffect(() => {
    // Title
    document.title = config.title;

    // Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', config.description);

    // Canonical URL
    if (config.canonical) {
      let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', config.canonical);
    }

    // Robots meta (pour noIndex si nécessaire)
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', config.noIndex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', config.ogTitle || config.title);

    // Open Graph Description
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', config.ogDescription || config.description);

    // Open Graph Type
    if (config.ogType) {
      let ogType = document.querySelector('meta[property="og:type"]');
      if (!ogType) {
        ogType = document.createElement('meta');
        ogType.setAttribute('property', 'og:type');
        document.head.appendChild(ogType);
      }
      ogType.setAttribute('content', config.ogType);
    }

    // Structured Data (JSON-LD) - Signal anti-phishing important
    if (config.structuredData) {
      // Remove any existing dynamic structured data
      const existingScript = document.querySelector('script[data-seo-dynamic="true"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-dynamic', 'true');
      script.textContent = JSON.stringify(config.structuredData);
      document.head.appendChild(script);
    }

    // Cleanup on unmount - restore defaults
    return () => {
      document.title = 'FINOM - Simulateur de Prêt Immobilier | Simulation Gratuite';
      
      const descMeta = document.querySelector('meta[name="description"]');
      if (descMeta) {
        descMeta.setAttribute('content', 'FINOM, votre partenaire financement immobilier. Simulez votre crédit, comparez les offres et obtenez les meilleurs taux. Service gratuit et personnalisé.');
      }

      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta) {
        robotsMeta.setAttribute('content', 'index, follow');
      }

      const dynamicScript = document.querySelector('script[data-seo-dynamic="true"]');
      if (dynamicScript) {
        dynamicScript.remove();
      }
    };
  }, [config.title, config.description, config.canonical, config.noIndex, config.ogTitle, config.ogDescription, config.ogType, config.structuredData]);
};

// Configurations SEO pré-définies pour les pages sensibles
export const SEO_CONFIGS = {
  login: {
    title: 'Connexion - FINOM | Accès Espace Client Sécurisé',
    description: 'Connectez-vous à votre espace client FINOM pour gérer votre prêt immobilier. Connexion sécurisée HTTPS avec authentification renforcée.',
    canonical: 'https://pret-finom.co/login',
    ogTitle: 'Connexion Sécurisée - FINOM',
    ogDescription: 'Accédez à votre espace personnel FINOM de manière sécurisée.',
    ogType: 'website',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Connexion FINOM',
      'description': 'Page de connexion sécurisée à l\'espace client FINOM',
      'url': 'https://pret-finom.co/login',
      'isPartOf': {
        '@type': 'WebSite',
        'name': 'FINOM',
        'url': 'https://pret-finom.co'
      },
      'potentialAction': {
        '@type': 'LoginAction',
        'target': 'https://pret-finom.co/login'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'FINOM Payments B.V.',
        'url': 'https://pret-finom.co',
        'logo': 'https://pret-finom.co/icons/icon-512x512.png'
      }
    }
  },
  register: {
    title: 'Créer un Compte - FINOM | Inscription Gratuite',
    description: 'Créez votre compte FINOM gratuitement et accédez à notre simulateur de prêt immobilier. Service sécurisé conforme RGPD.',
    canonical: 'https://pret-finom.co/register',
    ogTitle: 'Inscription Gratuite - FINOM',
    ogDescription: 'Créez votre compte FINOM et simulez votre prêt immobilier en quelques minutes.',
    ogType: 'website',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Inscription FINOM',
      'description': 'Créez votre compte FINOM pour accéder aux services de simulation de prêt immobilier',
      'url': 'https://pret-finom.co/register',
      'isPartOf': {
        '@type': 'WebSite',
        'name': 'FINOM',
        'url': 'https://pret-finom.co'
      },
      'potentialAction': {
        '@type': 'RegisterAction',
        'target': 'https://pret-finom.co/register'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'FINOM Payments B.V.',
        'url': 'https://pret-finom.co',
        'logo': 'https://pret-finom.co/icons/icon-512x512.png'
      }
    }
  },
  simulator: {
    title: 'Simulateur de Prêt Immobilier - FINOM | Calcul Gratuit',
    description: 'Simulez votre prêt immobilier gratuitement avec FINOM. Calculez vos mensualités, comparez les taux et estimez le coût total de votre crédit.',
    canonical: 'https://pret-finom.co/simulator',
    ogTitle: 'Simulateur de Prêt Immobilier - FINOM',
    ogDescription: 'Calculez vos mensualités et comparez les taux de crédit immobilier.',
    ogType: 'website',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'Simulateur de Prêt FINOM',
      'description': 'Outil de simulation de crédit immobilier en ligne',
      'url': 'https://pret-finom.co/simulator',
      'applicationCategory': 'FinanceApplication',
      'operatingSystem': 'Web',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'EUR'
      },
      'provider': {
        '@type': 'Organization',
        'name': 'FINOM Payments B.V.',
        'url': 'https://pret-finom.co'
      }
    }
  }
};

export default useSEO;
