import React from 'react';
import Header from '../components/layout/Header';
import Card from '../components/finom/Card';
import Button from '../components/finom/Button';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, DollarSign, Briefcase, BarChart3, Clock, Building2, Home, AlertTriangle } from 'lucide-react';
import { RATE_TABLE, PROFILE_LABELS, PROFILE_COLORS, PROFILE_CRITERIA, getAllDurations, getAllProfiles, RateProfile } from '@/lib/rates';

const Rates: React.FC = () => {
  const navigate = useNavigate();
  const durations = getAllDurations();
  const profiles = getAllProfiles();

  const examples = [
    {
      title: 'Primo-accédant',
      amount: 200000,
      duration: 20,
      downPayment: 20000,
      downPaymentPercent: 10,
      rate: 3.45,
      monthlyPayment: 1138,
      totalCost: 273120,
      interest: 73120,
    },
    {
      title: 'Investissement locatif',
      amount: 150000,
      duration: 15,
      downPayment: 30000,
      downPaymentPercent: 20,
      rate: 3.30,
      monthlyPayment: 1058,
      totalCost: 190440,
      interest: 40440,
    },
    {
      title: 'Renégociation',
      capitalRestant: 180000,
      dureeRestante: 18,
      ancienTaux: 4.20,
      nouveauTaux: 3.20,
      economieMensuelle: 145,
      economieTotale: 31320,
    },
  ];

  const factors = [
    {
      icon: <DollarSign size={32} />,
      title: 'Apport personnel',
      description: "Plus votre apport est important (>20%), plus votre taux sera avantageux. Un apport conséquent réduit le risque pour la banque.",
      iconBg: '#fef3c7',
    },
    {
      icon: <Briefcase size={32} />,
      title: 'Situation professionnelle',
      description: "Un CDI avec ancienneté, un statut de fonctionnaire ou une profession libérale établie favorisent l'obtention d'un meilleur taux.",
      iconBg: '#fef3c7',
    },
    {
      icon: <BarChart3 size={32} />,
      title: "Taux d'endettement",
      description: "Un taux d'endettement inférieur à 30% et un reste à vivre confortable démontrent votre capacité de remboursement.",
      iconBg: '#dbeafe',
    },
    {
      icon: <Clock size={32} />,
      title: 'Durée du prêt',
      description: 'Les prêts courts (10-15 ans) bénéficient généralement de taux plus bas que les prêts longs (20-25 ans).',
      iconBg: '#f3e8ff',
    },
    {
      icon: <Building2 size={32} />,
      title: 'Domiciliation bancaire',
      description: 'Domicilier vos revenus chez FINOM peut vous faire bénéficier d\'une réduction de taux de 0,10 à 0,20%.',
      iconBg: '#e0e7ff',
    },
    {
      icon: <Home size={32} />,
      title: 'Type de bien',
      description: "L'achat d'une résidence principale bénéficie de conditions plus avantageuses qu'un investissement locatif ou une résidence secondaire.",
      iconBg: '#dcfce7',
    },
  ];

  const importantInfo = [
    'Les taux affichés sont des taux nominaux hors assurance emprunteur',
    'Le TAEG (Taux Annuel Effectif Global) inclut les frais de dossier, de garantie et l\'assurance',
    'Les taux sont susceptibles d\'évoluer en fonction des conditions de marché',
    'Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager',
    'Aucun versement ne peut être exigé avant l\'obtention d\'un prêt',
  ];

  return (
    <>
      <Header />
      <div className="rates-page">
        {/* Hero Section */}
        <section className="rates-hero">
          <div className="container">
            <div className="hero-icon">
              <TrendingUp size={48} />
            </div>
            <h1>Nos Taux de Crédit Immobilier</h1>
            <p>Découvrez nos taux actuels et les facteurs qui influencent votre proposition personnalisée.</p>
            <div className="update-badge">
              Taux mis à jour le 7 janvier 2026
            </div>
          </div>
        </section>

        {/* Rate Table Section */}
        <section className="rate-table-section">
          <div className="container">
            <Card padding="xl" className="rate-table-card">
              <h2>Barème indicatif des taux</h2>
              <p className="rate-table-description">
                Les taux ci-dessous sont indicatifs et correspondent à différents profils emprunteurs. 
                Votre taux personnalisé sera déterminé après étude de votre dossier.
              </p>

              <div className="rate-table-wrapper">
                <table className="rate-table">
                  <thead>
                    <tr>
                      <th className="duration-header">Durée</th>
                      {profiles.map(profile => (
                        <th 
                          key={profile} 
                          style={{ backgroundColor: PROFILE_COLORS[profile].header }}
                          className="profile-header"
                        >
                          {PROFILE_LABELS[profile]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {durations.map((duration, index) => (
                      <tr key={duration} className={index % 2 === 0 ? 'even' : 'odd'}>
                        <td className="duration-cell">{duration} ans</td>
                        {profiles.map(profile => (
                          <td 
                            key={profile}
                            style={{ backgroundColor: PROFILE_COLORS[profile].bg }}
                            className="rate-cell"
                          >
                            <span style={{ color: PROFILE_COLORS[profile].text }}>
                              {RATE_TABLE[duration][profile].toFixed(2).replace('.', ',')}%
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Profile Criteria */}
              <div className="profile-criteria">
                {profiles.map(profile => (
                  <div key={profile} className="criteria-item">
                    <span 
                      className="criteria-dot"
                      style={{ backgroundColor: PROFILE_COLORS[profile].header }}
                    />
                    <strong>{PROFILE_LABELS[profile]} :</strong>
                    <span>{PROFILE_CRITERIA[profile]}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* Examples Section */}
        <section className="examples-section">
          <div className="container">
            <div className="section-header">
              <span className="section-icon">💡</span>
              <h2>Exemples concrets</h2>
            </div>

            <div className="examples-grid">
              {examples.map((example, index) => (
                <Card key={index} padding="lg" className="example-card">
                  <h3 className="example-title">
                    Exemple {index + 1} : {example.title}
                  </h3>

                  <div className="example-details">
                    {'amount' in example && (
                      <>
                        <p><strong>Montant :</strong> {example.amount.toLocaleString()} €</p>
                        <p><strong>Durée :</strong> {example.duration} ans</p>
                        <p><strong>Apport :</strong> {example.downPayment?.toLocaleString()} € ({example.downPaymentPercent}%)</p>
                        <p><strong>Taux :</strong> {example.rate}%</p>
                      </>
                    )}
                    {'capitalRestant' in example && (
                      <>
                        <p><strong>Capital restant :</strong> {example.capitalRestant.toLocaleString()} €</p>
                        <p><strong>Durée restante :</strong> {example.dureeRestante} ans</p>
                        <p><strong>Ancien taux :</strong> {example.ancienTaux}%</p>
                        <p><strong>Nouveau taux :</strong> {example.nouveauTaux}%</p>
                      </>
                    )}
                  </div>

                  <div className="example-divider" />

                  <div className="example-results">
                    {'monthlyPayment' in example && (
                      <>
                        <p><strong>Mensualité :</strong> {example.monthlyPayment.toLocaleString()} €/mois</p>
                        <p><strong>Coût total :</strong> {example.totalCost.toLocaleString()} €</p>
                        <p className="interest-note">(dont {example.interest?.toLocaleString()} € d'intérêts)</p>
                      </>
                    )}
                    {'economieMensuelle' in example && (
                      <>
                        <p><strong>Économie mensuelle :</strong> {example.economieMensuelle} €/mois</p>
                        <p><strong>Économie totale :</strong> {example.economieTotale.toLocaleString()} €</p>
                        <p className="interest-note">(sur la durée restante)</p>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Factors Section */}
        <section className="factors-section">
          <div className="container">
            <div className="section-header">
              <span className="section-icon">🎯</span>
              <h2>Ce qui influence votre taux</h2>
            </div>

            <div className="factors-grid">
              {factors.map((factor, index) => (
                <Card key={index} padding="lg" className="factor-card">
                  <div className="factor-icon" style={{ backgroundColor: factor.iconBg }}>
                    {factor.icon}
                  </div>
                  <h3>{factor.title}</h3>
                  <p>{factor.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Important Info Section */}
        <section className="important-section">
          <div className="container">
            <Card padding="xl" className="important-card">
              <div className="important-header">
                <AlertTriangle size={32} className="warning-icon" />
                <h2>Informations importantes</h2>
              </div>
              <ul className="important-list">
                {importantInfo.map((info, index) => (
                  <li key={index}>{info}</li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Prêt à démarrer votre projet ?</h2>
              <p>Obtenez une simulation personnalisée en quelques minutes</p>
              <div className="cta-buttons">
                <Button variant="primary" size="lg" onClick={() => navigate('/simulator')}>
                  Simuler mon prêt
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/register')}>
                  Créer un compte
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

    </>
  );
};

export default Rates;
