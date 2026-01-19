import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/finom/Card';
import Button from '../components/finom/Button';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, DollarSign, Briefcase, BarChart3, Clock, Building2, Home, AlertTriangle } from 'lucide-react';
import { RATE_TABLE, PROFILE_LABELS, PROFILE_COLORS, PROFILE_CRITERIA, getAllDurations, getAllProfiles } from '@/lib/rates';

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
      icon: <DollarSign size={28} />,
      title: 'Apport personnel',
      description: "Plus votre apport est important (>20%), plus votre taux sera avantageux.",
    },
    {
      icon: <Briefcase size={28} />,
      title: 'Situation professionnelle',
      description: "Un CDI avec ancienneté favorise l'obtention d'un meilleur taux.",
    },
    {
      icon: <BarChart3 size={28} />,
      title: "Taux d'endettement",
      description: "Un taux d'endettement inférieur à 30% est recommandé.",
    },
    {
      icon: <Clock size={28} />,
      title: 'Durée du prêt',
      description: 'Les prêts courts bénéficient de taux plus bas.',
    },
    {
      icon: <Building2 size={28} />,
      title: 'Domiciliation bancaire',
      description: 'Domicilier vos revenus peut réduire votre taux de 0,10 à 0,20%.',
    },
    {
      icon: <Home size={28} />,
      title: 'Type de bien',
      description: "L'achat d'une résidence principale bénéficie de meilleures conditions.",
    },
  ];

  return (
    <>
      <Header />
      <main className="rates-page">
        {/* Hero Section */}
        <section className="page-hero">
          <div className="container">
            <span className="hero-badge">TAUX IMMOBILIERS</span>
            <div className="hero-icon-wrapper">
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
        <section className="rates-content">
          <div className="container">
            <Card padding="xl" className="rate-table-card animate-fade-in">
              <h2>📊 Barème indicatif des taux</h2>
              <p className="section-desc">
                Les taux ci-dessous sont indicatifs et correspondent à différents profils emprunteurs.
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

            {/* Examples Section */}
            <div className="section-header animate-fade-in">
              <h2>💡 Exemples concrets</h2>
            </div>

            <div className="examples-grid">
              {examples.map((example, index) => (
                <Card key={index} padding="lg" className="example-card animate-fade-in">
                  <h3 className="example-title">{example.title}</h3>
                  <div className="example-details">
                    {'amount' in example && (
                      <>
                        <div className="detail-row"><span>Montant</span><span>{example.amount.toLocaleString()} €</span></div>
                        <div className="detail-row"><span>Durée</span><span>{example.duration} ans</span></div>
                        <div className="detail-row"><span>Apport</span><span>{example.downPayment?.toLocaleString()} € ({example.downPaymentPercent}%)</span></div>
                        <div className="detail-row accent"><span>Taux</span><span>{example.rate}%</span></div>
                      </>
                    )}
                    {'capitalRestant' in example && (
                      <>
                        <div className="detail-row"><span>Capital restant</span><span>{example.capitalRestant.toLocaleString()} €</span></div>
                        <div className="detail-row"><span>Durée restante</span><span>{example.dureeRestante} ans</span></div>
                        <div className="detail-row"><span>Ancien taux</span><span>{example.ancienTaux}%</span></div>
                        <div className="detail-row accent"><span>Nouveau taux</span><span>{example.nouveauTaux}%</span></div>
                      </>
                    )}
                  </div>
                  <div className="example-result">
                    {'monthlyPayment' in example && (
                      <>
                        <div className="result-main">{example.monthlyPayment.toLocaleString()} €<span>/mois</span></div>
                        <div className="result-sub">Coût total : {example.totalCost.toLocaleString()} €</div>
                      </>
                    )}
                    {'economieMensuelle' in example && (
                      <>
                        <div className="result-main">-{example.economieMensuelle} €<span>/mois</span></div>
                        <div className="result-sub">Économie totale : {example.economieTotale.toLocaleString()} €</div>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Factors Section */}
            <div className="section-header animate-fade-in">
              <h2>🎯 Ce qui influence votre taux</h2>
            </div>

            <div className="factors-grid">
              {factors.map((factor, index) => (
                <Card key={index} padding="lg" className="factor-card animate-fade-in">
                  <div className="factor-icon">{factor.icon}</div>
                  <h4>{factor.title}</h4>
                  <p>{factor.description}</p>
                </Card>
              ))}
            </div>

            {/* Important Info */}
            <Card padding="xl" className="important-card animate-fade-in">
              <div className="important-header">
                <AlertTriangle size={28} />
                <h3>Informations importantes</h3>
              </div>
              <ul className="important-list">
                <li>Les taux affichés sont des taux nominaux hors assurance emprunteur</li>
                <li>Le TAEG inclut les frais de dossier, de garantie et l'assurance</li>
                <li>Les taux sont susceptibles d'évoluer selon les conditions de marché</li>
                <li>Un crédit vous engage et doit être remboursé</li>
              </ul>
            </Card>

            {/* CTA Section */}
            <div className="cta-section animate-fade-in">
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
      </main>
      <Footer />

      <style>{`
        .rates-page {
          background: var(--finom-bg, #F8FAFC);
          min-height: 100vh;
        }

        .page-hero {
          background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
          padding: 6rem 1.5rem 5rem;
          text-align: center;
          position: relative;
        }

        .page-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 20%, rgba(254, 66, 180, 0.15) 0%, transparent 50%);
        }

        .hero-badge {
          display: inline-block;
          background: linear-gradient(135deg, #FE42B4 0%, #D61F8D 100%);
          color: white;
          padding: 0.5rem 1.25rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          margin-bottom: 1.5rem;
        }

        .hero-icon-wrapper {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: #FE42B4;
        }

        .page-hero h1 {
          color: white;
          font-size: clamp(2rem, 5vw, 2.75rem);
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .page-hero p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .update-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.85rem;
          margin-top: 1.5rem;
        }

        .rates-content {
          padding: 4rem 1.5rem;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .rate-table-card {
          margin-bottom: 3rem;
        }

        .rate-table-card h2 {
          margin-bottom: 0.5rem;
        }

        .section-desc {
          color: #64748B;
          margin-bottom: 2rem;
        }

        .rate-table-wrapper {
          overflow-x: auto;
          margin-bottom: 2rem;
        }

        .rate-table {
          width: 100%;
          border-collapse: collapse;
          border-radius: 12px;
          overflow: hidden;
        }

        .rate-table th, .rate-table td {
          padding: 1rem;
          text-align: center;
        }

        .duration-header {
          background: #F1F5F9;
          font-weight: 600;
        }

        .profile-header {
          color: white;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .duration-cell {
          background: #F8FAFC;
          font-weight: 600;
        }

        .rate-cell span {
          font-weight: 700;
        }

        .profile-criteria {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .criteria-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .criteria-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .section-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .section-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
        }

        .examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 4rem;
        }

        .example-card {
          border-left: 4px solid #FE42B4;
        }

        .example-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #0F172A;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #E2E8F0;
          font-size: 0.9rem;
        }

        .detail-row.accent span:last-child {
          color: #FE42B4;
          font-weight: 700;
        }

        .example-result {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 2px solid #E2E8F0;
          text-align: center;
        }

        .result-main {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0F172A;
        }

        .result-main span {
          font-size: 1rem;
          font-weight: 400;
          color: #64748B;
        }

        .result-sub {
          font-size: 0.9rem;
          color: #64748B;
        }

        .factors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .factor-card {
          text-align: center;
        }

        .factor-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #FE42B4 0%, #D61F8D 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: white;
        }

        .factor-card h4 {
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .factor-card p {
          color: #64748B;
          font-size: 0.9rem;
        }

        .important-card {
          background: #FEF3C7;
          border: 1px solid #FCD34D;
          margin-bottom: 3rem;
        }

        .important-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          color: #92400E;
        }

        .important-header h3 {
          margin: 0;
          color: #92400E;
        }

        .important-list {
          margin: 0;
          padding-left: 1.5rem;
        }

        .important-list li {
          color: #92400E;
          margin-bottom: 0.5rem;
        }

        .cta-section {
          text-align: center;
          padding: 3rem;
          background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
          border-radius: 24px;
          color: white;
        }

        .cta-section h2 {
          color: white;
          margin-bottom: 0.5rem;
        }

        .cta-section p {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 1.5rem;
        }

        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .page-hero {
            padding: 4rem 1rem 3rem;
          }
          
          .cta-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
};

export default Rates;