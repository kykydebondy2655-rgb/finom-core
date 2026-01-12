import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from '../components/layout/Header';
import Card from '../components/finom/Card';
import Button from '../components/finom/Button';
import { getRateForProfile, PROFILE_LABELS, RateProfile } from '@/lib/rates';
import {
  performSimulation,
  safeFormat,
  safeNumber,
  INSURANCE_RATE,
  SimulationResult
} from '@/lib/loanCalculations';
import { loansApi } from '@/services/api';
import { emailService } from '@/services/emailService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FormData {
  propertyPrice: number;
  notaryFees: number;
  agencyFees: number;
  worksAmount: number;
  downPayment: number;
  durationYears: number;
  rate: number;
  profile: RateProfile;
  profileLabel: string;
  projectType: string;
}

const Simulator = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    propertyPrice: 250000,
    notaryFees: 20000,
    agencyFees: 5000,
    worksAmount: 0,
    downPayment: 30000,
    durationYears: 20,
    rate: 3.22,
    profile: 'standard',
    profileLabel: 'Profil Standard',
    projectType: 'achat_residence_principale'
  });

  const [result, setResult] = useState<SimulationResult | null>(null);

  // Recalculate on form change
  useEffect(() => {
    calculate();
  }, [
    formData.propertyPrice,
    formData.notaryFees,
    formData.agencyFees,
    formData.worksAmount,
    formData.downPayment,
    formData.durationYears
  ]);

  const calculate = () => {
    // Calculate contribution percentage based on property price only
    const totalProject = safeNumber(formData.propertyPrice) + safeNumber(formData.notaryFees) + 
                         safeNumber(formData.agencyFees) + safeNumber(formData.worksAmount);
    const contributionPercent = totalProject > 0 
      ? safeNumber(formData.downPayment) / totalProject 
      : 0;

    // Get rate based on profile
    const rateData = getRateForProfile(formData.durationYears, contributionPercent);
    
    // Update rate if changed
    if (rateData.rate !== formData.rate || rateData.profile !== formData.profile) {
      setFormData(prev => ({
        ...prev,
        rate: rateData.rate,
        profile: rateData.profile,
        profileLabel: rateData.profileLabel
      }));
    }

    // Perform full simulation
    const simulation = performSimulation({
      propertyPrice: formData.propertyPrice,
      notaryFees: formData.notaryFees,
      agencyFees: formData.agencyFees,
      worksAmount: formData.worksAmount,
      downPayment: formData.downPayment,
      durationYears: formData.durationYears,
      annualRate: rateData.rate
    });

    setResult(simulation);
  };

  const updateField = (field: keyof FormData, value: number | string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateLoan = async () => {
    if (!isAuthenticated || !user) {
      navigate('/login', { state: { from: { pathname: '/simulator' } } });
      return;
    }

    if (!result || !result.isValid) {
      toast.error('Simulation invalide. Veuillez vérifier vos paramètres.');
      return;
    }

    try {
      setLoading(true);

      const loanData = {
        user_id: user.id,
        amount: result.loanAmount,
        duration: formData.durationYears,
        rate: formData.rate,
        down_payment: formData.downPayment,
        property_price: formData.propertyPrice,
        notary_fees: formData.notaryFees,
        agency_fees: formData.agencyFees,
        works_amount: formData.worksAmount,
        monthly_credit: result.monthlyCredit,
        monthly_insurance: result.monthlyInsurance,
        monthly_payment: result.monthlyTotal,
        monthly_payment_est: result.monthlyTotal,
        total_interest: result.totalInterest,
        insurance_cost: result.totalInsurance,
        total_fees: result.bankFees,
        total_amount: result.loanAmount + result.totalCost,
        interest_rate_used: formData.rate,
        insurance_rate_used: INSURANCE_RATE,
        fees_used: result.bankFees,
        project_type: formData.projectType,
        status: 'pending',
        is_draft: false
      };

      const newLoan = await loansApi.create(loanData);

      // Send confirmation email (non-blocking)
      if (user.email) {
        const clientName = (user as any).firstName || 'Client';
        emailService.sendLoanSubmitted(
          user.email,
          clientName,
          newLoan.id,
          result.loanAmount,
          result.durationMonths,
          result.monthlyTotal
        ).catch(err => console.error('Email error:', err));
      }

      // Notify admins (non-blocking)
      const displayName = (user as any).firstName || user.email || 'Client';
      notifyAdmins(newLoan.id, result.loanAmount, displayName)
        .catch(err => console.error('Notification error:', err));

      toast.success('Votre demande de prêt a été créée avec succès !');
      navigate('/loans');
    } catch (err) {
      console.error('Error creating loan:', err);
      toast.error('Erreur lors de la création de votre demande');
    } finally {
      setLoading(false);
    }
  };

  const notifyAdmins = async (loanId: string, amount: number, clientName: string) => {
    const { data: adminRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (!adminRoles || adminRoles.length === 0) return;

    const notifications = adminRoles.map(admin => ({
      user_id: admin.user_id,
      type: 'new_loan',
      category: 'loan',
      title: '📋 Nouvelle demande de prêt',
      message: `${clientName} a soumis une demande de ${amount.toLocaleString('fr-FR')} €`,
      related_entity: 'loan_applications',
      related_id: loanId
    }));

    await supabase.from('notifications').insert(notifications);
  };

  const getContributionPercent = () => {
    const totalProject = safeNumber(formData.propertyPrice) + safeNumber(formData.notaryFees) + 
                         safeNumber(formData.agencyFees) + safeNumber(formData.worksAmount);
    if (totalProject <= 0) return 0;
    return Math.round((safeNumber(formData.downPayment) / totalProject) * 100);
  };

  return (
    <>
      <Header />
      <div className="simulator-page">
        <section className="hero-simulator fade-in">
          <div className="container">
            <div className="hero-content">
              <span className="badge-hero">BANQUE DIGITALE</span>
              <h1>Simulez votre projet immobilier</h1>
              <p>Proposition immédiate & dossier 100% en ligne.</p>
            </div>
          </div>
        </section>

        <div className="container main-content">
          <div className="simulator-layout">
            {/* Form Card */}
            <Card className="form-card fade-in" padding="xl">
              <h2>📝 Votre projet</h2>
              
              <div className="form-section">
                <div className="form-group">
                  <label>Type de projet</label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => updateField('projectType', e.target.value)}
                    className="select-input"
                  >
                    <option value="achat_residence_principale">Achat résidence principale</option>
                    <option value="achat_residence_secondaire">Achat résidence secondaire</option>
                    <option value="investissement_locatif">Investissement locatif</option>
                    <option value="construction">Construction</option>
                    <option value="renovation">Rénovation</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Prix du bien immobilier</label>
                  <input
                    type="number"
                    value={formData.propertyPrice}
                    onChange={(e) => updateField('propertyPrice', Number(e.target.value))}
                    min={10000}
                    step={5000}
                    className="number-input"
                  />
                  <span className="input-suffix">€</span>
                </div>

                <div className="form-row">
                  <div className="form-group half">
                    <label>Frais de notaire</label>
                    <input
                      type="number"
                      value={formData.notaryFees}
                      onChange={(e) => updateField('notaryFees', Number(e.target.value))}
                      min={0}
                      step={500}
                      className="number-input"
                    />
                    <span className="input-suffix">€</span>
                  </div>

                  <div className="form-group half">
                    <label>Frais d'agence</label>
                    <input
                      type="number"
                      value={formData.agencyFees}
                      onChange={(e) => updateField('agencyFees', Number(e.target.value))}
                      min={0}
                      step={500}
                      className="number-input"
                    />
                    <span className="input-suffix">€</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Travaux (optionnel)</label>
                  <input
                    type="number"
                    value={formData.worksAmount}
                    onChange={(e) => updateField('worksAmount', Number(e.target.value))}
                    min={0}
                    step={1000}
                    className="number-input"
                  />
                  <span className="input-suffix">€</span>
                </div>
              </div>

              <h2>💰 Votre financement</h2>

              <div className="form-section">
                <div className="form-group">
                  <label>Apport personnel</label>
                  <input
                    type="number"
                    value={formData.downPayment}
                    onChange={(e) => updateField('downPayment', Number(e.target.value))}
                    min={0}
                    step={1000}
                    className="number-input"
                  />
                  <span className="input-suffix">€</span>
                  <div className="input-hint">{getContributionPercent()}% du projet total</div>
                </div>

                <div className="form-group">
                  <label>Durée du prêt</label>
                  <input
                    type="range"
                    min={5}
                    max={30}
                    step={1}
                    value={formData.durationYears}
                    onChange={(e) => updateField('durationYears', Number(e.target.value))}
                    className="range-input"
                  />
                  <div className="value-display">{formData.durationYears} ans</div>
                </div>

                <div className="rate-display">
                  <div className="rate-info">
                    <span className="rate-label">Taux estimé</span>
                    <span className="rate-value">{formData.rate.toFixed(2)}%</span>
                  </div>
                  <span className="profile-badge">{formData.profileLabel}</span>
                </div>

                <div className="insurance-notice">
                  <span className="insurance-icon">🛡️</span>
                  <div className="insurance-text">
                    <strong>Assurance emprunteur incluse</strong>
                    <span>Taux fixe : {INSURANCE_RATE}% par an (obligatoire)</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Results Cards */}
            {result && result.isValid && (
              <div className="results-wrapper fade-in">
                {/* Main Result Card */}
                <Card className="result-card main-result" padding="xl">
                  <div className="result-header">Mensualité totale</div>
                  <div className="result-amount">
                    {safeFormat(result.monthlyTotal)} €
                    <span className="per-month">/mois</span>
                  </div>
                  <div className="monthly-breakdown">
                    <div className="breakdown-item">
                      <span>Crédit</span>
                      <span>{safeFormat(result.monthlyCredit)} €</span>
                    </div>
                    <div className="breakdown-item insurance">
                      <span>🛡️ Assurance</span>
                      <span>{safeFormat(result.monthlyInsurance)} €</span>
                    </div>
                  </div>
                </Card>

                {/* Project Summary Card */}
                <Card className="result-card" padding="lg">
                  <h3>📊 Récapitulatif du projet</h3>
                  <div className="summary-rows">
                    <div className="summary-row">
                      <span>Prix du bien</span>
                      <span>{safeFormat(formData.propertyPrice)} €</span>
                    </div>
                    <div className="summary-row">
                      <span>Frais de notaire</span>
                      <span>{safeFormat(formData.notaryFees)} €</span>
                    </div>
                    <div className="summary-row">
                      <span>Frais d'agence</span>
                      <span>{safeFormat(formData.agencyFees)} €</span>
                    </div>
                    {formData.worksAmount > 0 && (
                      <div className="summary-row">
                        <span>Travaux</span>
                        <span>{safeFormat(formData.worksAmount)} €</span>
                      </div>
                    )}
                    <div className="summary-row highlight">
                      <span>Coût total du projet</span>
                      <span>
                        {safeFormat(
                          formData.propertyPrice + formData.notaryFees + 
                          formData.agencyFees + formData.worksAmount
                        )} €
                      </span>
                    </div>
                    <div className="summary-row apport">
                      <span>− Apport personnel</span>
                      <span>{safeFormat(formData.downPayment)} €</span>
                    </div>
                    <div className="summary-row total">
                      <span>= Capital emprunté</span>
                      <span>{safeFormat(result.loanAmount)} €</span>
                    </div>
                  </div>
                </Card>

                {/* Cost Breakdown Card */}
                <Card className="result-card" padding="lg">
                  <h3>💶 Coût du crédit</h3>
                  <div className="summary-rows">
                    <div className="summary-row">
                      <span>Durée</span>
                      <span>{formData.durationYears} ans ({result.durationMonths} mois)</span>
                    </div>
                    <div className="summary-row">
                      <span>Taux du crédit</span>
                      <span>{formData.rate.toFixed(2)}%</span>
                    </div>
                    <div className="summary-row">
                      <span>Coût total des intérêts</span>
                      <span>{safeFormat(result.totalInterest)} €</span>
                    </div>
                    <div className="summary-row insurance-row">
                      <span>🛡️ Coût total assurance</span>
                      <span>{safeFormat(result.totalInsurance)} €</span>
                    </div>
                    <div className="summary-row">
                      <span>Frais de dossier & garantie</span>
                      <span>{safeFormat(result.bankFees)} €</span>
                    </div>
                    <div className="summary-row total">
                      <span>Coût global du crédit</span>
                      <span>{safeFormat(result.totalCost)} €</span>
                    </div>
                    <div className="summary-row taeg">
                      <span>TAEG estimé</span>
                      <span>{result.taegEstimate.toFixed(2)}%</span>
                    </div>
                  </div>
                </Card>

                {/* CTA Buttons */}
                <div className="cta-buttons">
                  <Button 
                    onClick={handleCreateLoan} 
                    variant="primary" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Création en cours...' : '📋 Faire une demande de prêt'}
                  </Button>
                  <Button onClick={() => navigate('/how-it-works')} variant="ghost" size="md">
                    Comment ça marche ?
                  </Button>
                </div>
              </div>
            )}

            {/* Invalid simulation message */}
            {result && !result.isValid && (
              <div className="results-wrapper fade-in">
                <Card className="result-card error-card" padding="xl">
                  <div className="error-icon">⚠️</div>
                  <h3>Simulation impossible</h3>
                  <p>Veuillez vérifier vos paramètres :</p>
                  <ul>
                    <li>Le capital emprunté doit être positif</li>
                    <li>La durée doit être entre 5 et 30 ans</li>
                    <li>L'apport ne peut pas dépasser le coût total du projet</li>
                  </ul>
                </Card>
              </div>
            )}
          </div>
        </div>

        <style>{`
          .simulator-page {
            background-color: hsl(var(--background));
            min-height: 100vh;
            padding-bottom: 6rem;
          }
          .hero-simulator {
            position: relative;
            padding: 8rem 0 10rem;
            background: hsl(var(--secondary));
            color: hsl(var(--secondary-foreground));
            margin-bottom: -120px;
          }
          .badge-hero {
            display: inline-block;
            background: hsl(var(--primary));
            color: hsl(var(--primary-foreground));
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: 800;
            font-size: 0.7rem;
            letter-spacing: 0.1em;
            margin-bottom: 1.5rem;
          }
          .hero-content h1 {
            color: white;
            font-size: clamp(2.5rem, 5vw, 4.5rem);
            max-width: 800px;
            margin-bottom: 1rem;
          }
          .hero-content p {
            font-size: 1.5rem;
            opacity: 0.7;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1.5rem;
          }
          .main-content {
            position: relative;
            z-index: 10;
          }
          .simulator-layout {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            align-items: start;
          }
          .form-card h2 {
            margin-bottom: 1.5rem;
            font-size: 1.25rem;
            color: hsl(var(--foreground));
          }
          .form-card h2:not(:first-of-type) {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid hsl(var(--border));
          }
          .form-section {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }
          .form-group {
            position: relative;
          }
          .form-group.half {
            flex: 1;
          }
          .form-row {
            display: flex;
            gap: 1rem;
          }
          .form-group label {
            display: block;
            font-weight: 600;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            color: hsl(var(--foreground));
          }
          .select-input, .number-input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid hsl(var(--border));
            border-radius: 8px;
            font-size: 1rem;
            background: hsl(var(--background));
            color: hsl(var(--foreground));
            transition: border-color 0.2s;
          }
          .select-input:focus, .number-input:focus {
            outline: none;
            border-color: hsl(var(--primary));
          }
          .input-suffix {
            position: absolute;
            right: 1rem;
            top: 2.25rem;
            color: hsl(var(--muted-foreground));
            font-weight: 500;
          }
          .input-hint {
            margin-top: 0.25rem;
            font-size: 0.85rem;
            color: hsl(var(--muted-foreground));
          }
          .range-input {
            width: 100%;
            height: 8px;
            border-radius: 4px;
            background: hsl(var(--muted));
            appearance: none;
            cursor: pointer;
          }
          .range-input::-webkit-slider-thumb {
            appearance: none;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: hsl(var(--primary));
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          }
          .value-display {
            margin-top: 0.5rem;
            font-size: 1.5rem;
            font-weight: 700;
            color: hsl(var(--primary));
          }
          .rate-display {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
            background: hsl(var(--muted));
            border-radius: 8px;
            margin-top: 0.5rem;
          }
          .rate-info {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          .rate-label {
            color: hsl(var(--muted-foreground));
            font-size: 0.9rem;
          }
          .rate-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: hsl(var(--secondary));
          }
          .profile-badge {
            background: hsl(var(--secondary));
            color: white;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
          }
          .insurance-notice {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.05));
            border: 1px solid hsl(var(--primary) / 0.2);
            border-radius: 8px;
            margin-top: 0.5rem;
          }
          .insurance-icon {
            font-size: 1.5rem;
          }
          .insurance-text {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }
          .insurance-text strong {
            color: hsl(var(--foreground));
            font-size: 0.9rem;
          }
          .insurance-text span {
            color: hsl(var(--muted-foreground));
            font-size: 0.85rem;
          }
          .results-wrapper {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }
          .result-card {
            background: hsl(var(--card));
          }
          .result-card.main-result {
            background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%);
            color: white;
            text-align: center;
          }
          .result-header {
            font-size: 0.9rem;
            opacity: 0.9;
            margin-bottom: 0.5rem;
          }
          .result-amount {
            font-size: 3rem;
            font-weight: 700;
          }
          .result-amount .per-month {
            font-size: 1.25rem;
            font-weight: 400;
            opacity: 0.8;
          }
          .monthly-breakdown {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(255,255,255,0.2);
          }
          .breakdown-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            font-size: 0.9rem;
          }
          .breakdown-item span:first-child {
            opacity: 0.8;
          }
          .breakdown-item.insurance {
            background: rgba(255,255,255,0.15);
            padding: 0.5rem 1rem;
            border-radius: 8px;
          }
          .result-card h3 {
            margin-bottom: 1rem;
            font-size: 1rem;
            color: hsl(var(--foreground));
          }
          .summary-rows {
            display: flex;
            flex-direction: column;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem 0;
            border-bottom: 1px solid hsl(var(--border));
            font-size: 0.9rem;
          }
          .summary-row:last-child {
            border-bottom: none;
          }
          .summary-row span:first-child {
            color: hsl(var(--muted-foreground));
          }
          .summary-row span:last-child {
            font-weight: 600;
            color: hsl(var(--foreground));
          }
          .summary-row.highlight {
            background: hsl(var(--muted));
            margin: 0.5rem -1rem;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            border-bottom: none;
          }
          .summary-row.apport span:last-child {
            color: hsl(var(--primary));
          }
          .summary-row.total {
            font-weight: 700;
            font-size: 1rem;
            padding-top: 1rem;
            margin-top: 0.5rem;
            border-top: 2px solid hsl(var(--primary));
            border-bottom: none;
          }
          .summary-row.total span:last-child {
            color: hsl(var(--primary));
            font-size: 1.1rem;
          }
          .summary-row.insurance-row {
            background: linear-gradient(90deg, hsl(var(--primary) / 0.1), transparent);
            margin: 0.25rem -1rem;
            padding: 0.75rem 1rem;
            border-radius: 8px;
          }
          .summary-row.taeg {
            background: hsl(var(--muted));
            margin: 0.5rem -1rem -1rem;
            padding: 0.75rem 1rem;
            border-radius: 0 0 8px 8px;
          }
          .cta-buttons {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .error-card {
            text-align: center;
            background: hsl(var(--destructive) / 0.1);
            border: 1px solid hsl(var(--destructive) / 0.3);
          }
          .error-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .error-card h3 {
            color: hsl(var(--destructive));
            margin-bottom: 0.5rem;
          }
          .error-card ul {
            text-align: left;
            margin-top: 1rem;
            padding-left: 1.5rem;
          }
          .error-card li {
            margin-bottom: 0.5rem;
            color: hsl(var(--muted-foreground));
          }
          .fade-in {
            animation: fadeIn 0.5s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @media (max-width: 900px) {
            .simulator-layout {
              grid-template-columns: 1fr;
            }
            .hero-simulator {
              padding: 5rem 0 8rem;
            }
            .form-row {
              flex-direction: column;
            }
            .result-amount {
              font-size: 2.5rem;
            }
            .monthly-breakdown {
              flex-direction: column;
              gap: 1rem;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default Simulator;
