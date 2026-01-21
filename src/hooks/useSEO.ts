import { useEffect } from 'react';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
  noIndex?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  structuredData?: object;
  breadcrumbs?: BreadcrumbItem[];
}

/**
 * Génère le schema BreadcrumbList pour Google
 */
const generateBreadcrumbSchema = (breadcrumbs: BreadcrumbItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': breadcrumbs.map((item, index) => ({
    '@type': 'ListItem',
    'position': index + 1,
    'name': item.name,
    'item': item.url
  }))
});

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

    // BreadcrumbList Schema
    if (config.breadcrumbs && config.breadcrumbs.length > 0) {
      const existingBreadcrumb = document.querySelector('script[data-seo-breadcrumb="true"]');
      if (existingBreadcrumb) {
        existingBreadcrumb.remove();
      }

      const breadcrumbScript = document.createElement('script');
      breadcrumbScript.type = 'application/ld+json';
      breadcrumbScript.setAttribute('data-seo-breadcrumb', 'true');
      breadcrumbScript.textContent = JSON.stringify(generateBreadcrumbSchema(config.breadcrumbs));
      document.head.appendChild(breadcrumbScript);
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

      const breadcrumbScript = document.querySelector('script[data-seo-breadcrumb="true"]');
      if (breadcrumbScript) {
        breadcrumbScript.remove();
      }
    };
  }, [config.title, config.description, config.canonical, config.noIndex, config.ogTitle, config.ogDescription, config.ogType, config.structuredData, config.breadcrumbs]);
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
    breadcrumbs: [
      { name: 'Accueil', url: 'https://pret-finom.co' },
      { name: 'Connexion', url: 'https://pret-finom.co/login' }
    ],
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
    breadcrumbs: [
      { name: 'Accueil', url: 'https://pret-finom.co' },
      { name: 'Inscription', url: 'https://pret-finom.co/register' }
    ],
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
    breadcrumbs: [
      { name: 'Accueil', url: 'https://pret-finom.co' },
      { name: 'Simulateur', url: 'https://pret-finom.co/simulator' }
    ],
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
  },
  rates: {
    title: 'Taux de Crédit Immobilier - FINOM | Barème Actuel',
    description: 'Consultez les taux de crédit immobilier actuels chez FINOM. Taux fixes compétitifs selon votre profil et la durée de votre prêt.',
    canonical: 'https://pret-finom.co/rates',
    ogTitle: 'Taux de Crédit Immobilier - FINOM',
    ogDescription: 'Découvrez nos taux de prêt immobilier actualisés selon votre profil.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Accueil', url: 'https://pret-finom.co' },
      { name: 'Nos Taux', url: 'https://pret-finom.co/rates' }
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Taux de Crédit Immobilier FINOM',
      'description': 'Barème des taux de crédit immobilier actuels',
      'url': 'https://pret-finom.co/rates',
      'isPartOf': {
        '@type': 'WebSite',
        'name': 'FINOM',
        'url': 'https://pret-finom.co'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'FINOM Payments B.V.',
        'url': 'https://pret-finom.co',
        'logo': 'https://pret-finom.co/icons/icon-512x512.png'
      }
    }
  },
  contact: {
    title: 'Contact - FINOM | Service Client Prêt Immobilier',
    description: 'Contactez FINOM pour toute question sur votre prêt immobilier. Notre équipe est disponible du lundi au samedi pour vous accompagner.',
    canonical: 'https://pret-finom.co/contact',
    ogTitle: 'Contactez FINOM',
    ogDescription: 'Notre équipe est à votre disposition pour répondre à vos questions.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Accueil', url: 'https://pret-finom.co' },
      { name: 'Contact', url: 'https://pret-finom.co/contact' }
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      'name': 'Contact FINOM',
      'description': 'Page de contact du service client FINOM',
      'url': 'https://pret-finom.co/contact',
      'mainEntity': {
        '@type': 'Organization',
        'name': 'FINOM Payments B.V.',
        'url': 'https://pret-finom.co',
        'logo': 'https://pret-finom.co/icons/icon-512x512.png',
        'contactPoint': {
          '@type': 'ContactPoint',
          'telephone': '+33-1-87-68-08-90',
          'contactType': 'customer service',
          'availableLanguage': ['French', 'English'],
          'areaServed': 'FR'
        },
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': '9 Rue du Quatre Septembre',
          'addressLocality': 'Paris',
          'postalCode': '75002',
          'addressCountry': 'FR'
        }
      }
    }
  },
  howItWorks: {
    title: 'Comment ça marche - FINOM | Processus de Prêt Simplifié',
    description: 'Découvrez comment obtenir votre prêt immobilier avec FINOM en 4 étapes simples. Simulation, dossier, validation et déblocage des fonds.',
    canonical: 'https://pret-finom.co/how-it-works',
    ogTitle: 'Comment fonctionne FINOM',
    ogDescription: 'Obtenez votre prêt immobilier en 4 étapes simples.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Accueil', url: 'https://pret-finom.co' },
      { name: 'Comment ça marche', url: 'https://pret-finom.co/how-it-works' }
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': 'Comment obtenir un prêt immobilier avec FINOM',
      'description': 'Guide étape par étape pour obtenir votre financement immobilier',
      'url': 'https://pret-finom.co/how-it-works',
      'step': [
        {
          '@type': 'HowToStep',
          'name': 'Simulation',
          'text': 'Simulez votre prêt en quelques clics'
        },
        {
          '@type': 'HowToStep',
          'name': 'Constitution du dossier',
          'text': 'Téléchargez vos documents justificatifs'
        },
        {
          '@type': 'HowToStep',
          'name': 'Analyse et validation',
          'text': 'Notre équipe étudie votre dossier'
        },
        {
          '@type': 'HowToStep',
          'name': 'Déblocage des fonds',
          'text': 'Signature chez le notaire et versement'
        }
      ]
    }
  },
  faq: {
    title: 'FAQ - FINOM | Questions Fréquentes Prêt Immobilier',
    description: 'Trouvez les réponses à vos questions sur le prêt immobilier avec FINOM. Taux, durée, apport, assurance et conditions expliqués.',
    canonical: 'https://pret-finom.co/faq',
    ogTitle: 'FAQ Prêt Immobilier - FINOM',
    ogDescription: 'Réponses aux questions fréquentes sur le crédit immobilier.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Accueil', url: 'https://pret-finom.co' },
      { name: 'FAQ', url: 'https://pret-finom.co/faq' }
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'name': 'FAQ FINOM - Questions Fréquentes',
      'description': 'Réponses aux questions fréquentes sur le crédit immobilier FINOM',
      'url': 'https://pret-finom.co/faq',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'FINOM délivre-t-elle directement des crédits immobiliers ?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Oui, FINOM est un établissement bancaire qui finance directement les projets immobiliers de ses clients.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Quels types de projets immobiliers financez-vous ?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Nous finançons l\'acquisition de résidences principales, secondaires et investissements locatifs.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Comment fonctionne la simulation de crédit ?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Notre simulateur vous permet d\'estimer votre capacité d\'emprunt et vos mensualités en quelques clics. Gratuit et sans engagement.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Quels documents dois-je fournir ?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Pièce d\'identité, justificatifs de revenus, relevés bancaires et justificatif de domicile.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Comment est analysée ma demande ?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Nos analystes étudient votre situation financière globale pour vous proposer les meilleures conditions.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Les taux affichés sont-ils garantis ?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Les taux sont indicatifs. Le taux définitif dépend de l\'étude de votre dossier.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Qu\'est-ce que le TAEG ?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Le Taux Annuel Effectif Global représente le coût total de votre crédit incluant intérêts et frais.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Mes données sont-elles sécurisées ?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Toutes vos données sont chiffrées et hébergées sur des serveurs sécurisés en Europe.'
          }
        },
        {
          '@type': 'Question',
          'name': 'FINOM est-elle régulée ?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'FINOM opère avec des établissements agréés par l\'ACPR et la BaFin.'
          }
        }
      ],
      'publisher': {
        '@type': 'Organization',
        'name': 'FINOM Payments B.V.',
        'url': 'https://pret-finom.co',
        'logo': 'https://pret-finom.co/icons/icon-512x512.png'
      }
    }
  },
  about: {
    title: 'À Propos - FINOM | Notre Mission et Équipe',
    description: 'Découvrez FINOM, votre partenaire de confiance pour le financement immobilier. Notre histoire, nos valeurs et notre engagement qualité.',
    canonical: 'https://pret-finom.co/about',
    ogTitle: 'À Propos de FINOM',
    ogDescription: 'Découvrez notre mission et notre équipe dédiée au financement immobilier.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Accueil', url: 'https://pret-finom.co' },
      { name: 'À Propos', url: 'https://pret-finom.co/about' }
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      'name': 'À Propos de FINOM',
      'description': 'Présentation de FINOM et de son équipe',
      'url': 'https://pret-finom.co/about',
      'mainEntity': {
        '@type': 'Organization',
        'name': 'FINOM Payments B.V.',
        'url': 'https://pret-finom.co',
        'foundingDate': '2019',
        'foundingLocation': 'Amsterdam, Netherlands'
      }
    }
  },
  home: {
    title: 'FINOM - Simulateur de Prêt Immobilier | Meilleurs Taux 2026',
    description: 'Simulez votre crédit immobilier gratuitement avec FINOM. Obtenez les meilleurs taux dès 2.25%, calculez vos mensualités et constituez votre dossier 100% en ligne.',
    canonical: 'https://pret-finom.co',
    ogTitle: 'FINOM - Simulateur de Prêt Immobilier',
    ogDescription: 'Simulez votre crédit immobilier gratuitement. Taux dès 2.25%, réponse sous 48h.',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Accueil', url: 'https://pret-finom.co' }
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'FINOM',
      'url': 'https://pret-finom.co',
      'description': 'Service de simulation et d\'obtention de prêt immobilier avec les meilleurs taux du marché',
      'publisher': {
        '@type': 'Organization',
        'name': 'FINOM Payments B.V.',
        'url': 'https://pret-finom.co',
        'logo': 'https://pret-finom.co/icons/icon-512x512.png'
      }
    }
  }
};

export default useSEO;
