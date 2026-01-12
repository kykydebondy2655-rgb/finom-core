import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, AuthUser } from '@/context/AuthContext';
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
import logger from '@/lib/logger';

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
        const clientName = user.firstName || 'Client';
        emailService.sendLoanSubmitted(
          user.email,
          clientName,
          newLoan.id,
          result.loanAmount,
          result.durationMonths,
          result.monthlyTotal
        ).catch(err => logger.logError('Email send error', err));
      }

      // Notify admins (non-blocking)
      const displayName = user.firstName || user.email || 'Client';
      notifyAdmins(newLoan.id, result.loanAmount, displayName)
        .catch(err => logger.logError('Admin notification error', err));

      toast.success('Votre demande de prêt a été créée avec succès !');
      navigate('/loans');
    } catch (err) {
      logger.logError('Error creating loan', err);
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
              <span className="badge-hero">SIMULATEUR DE PRÊT</span>
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
                    onChange={(e) => updateField('propertyPrice', Math.max(0, Number(e.target.value) || 0))}
                    min={0}
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
                      onChange={(e) => updateField('notaryFees', Math.max(0, Number(e.target.value) || 0))}
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
                      onChange={(e) => updateField('agencyFees', Math.max(0, Number(e.target.value) || 0))}
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
                    onChange={(e) => updateField('worksAmount', Math.max(0, Number(e.target.value) || 0))}
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
                    onChange={(e) => updateField('downPayment', Math.max(0, Number(e.target.value) || 0))}
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
                    disabled={loading || !result?.isValid}
                  >
                    {loading ? '⏳ Création en cours...' : '📋 Faire une demande de prêt'}
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

      </div>
    </>
  );
};

export default Simulator;
