import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  motion, 
  AnimatePresence, 
  fadeInUp, 
  staggerContainer, 
  scaleIn 
} from '@/components/animations';
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
import { useToast } from '@/components/finom/Toast';
import logger from '@/lib/logger';
import CoborrowerSection from '@/components/loans/CoborrowerSection';
import { FileText, Wallet, ShieldCheck, Calculator, CreditCard, PiggyBank, TrendingUp, Home } from 'lucide-react';

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
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [hasCoborrower, setHasCoborrower] = useState(false);
  const [coborrowerData, setCoborrowerData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    profession: '',
    employmentType: '',
    monthlyIncome: 0,
    monthlyCharges: 0
  });
  
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

      const loanData: Record<string, any> = {
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
        is_draft: false,
        has_coborrower: hasCoborrower,
        coborrower_data: hasCoborrower ? coborrowerData : null
      };

      const newLoan = await loansApi.create(loanData as any);

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
      title: 'Nouvelle demande de prêt',
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
        <motion.section 
          className="hero-simulator"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container">
            <motion.div 
              className="hero-content"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.span 
                className="badge-hero"
                variants={fadeInUp}
                transition={{ duration: 0.4 }}
              >
                SIMULATEUR DE PRÊT
              </motion.span>
              <motion.h1
                variants={fadeInUp}
                transition={{ duration: 0.4 }}
              >
                Simulez votre projet immobilier
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                transition={{ duration: 0.4 }}
              >
                Proposition immédiate & dossier 100% en ligne.
              </motion.p>
            </motion.div>
          </div>
        </motion.section>

        <div className="container main-content">
          <div className="simulator-layout">
            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="form-card" padding="xl">
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="form-section-title"
                >
                  <Home className="section-icon" size={24} />
                  Votre projet
                </motion.h2>
                
                <motion.div 
                  className="form-section"
                  initial="initial"
                  animate="animate"
                  variants={staggerContainer}
                >
                  <motion.div className="form-group" variants={fadeInUp}>
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
                  </motion.div>

                  <motion.div className="form-group" variants={fadeInUp}>
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
                  </motion.div>

                  <motion.div className="form-row" variants={fadeInUp}>
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
                  </motion.div>

                  <motion.div className="form-group" variants={fadeInUp}>
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
                  </motion.div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="form-section-title"
                >
                  <Wallet className="section-icon" size={24} />
                  Votre financement
                </motion.h2>

                <motion.div 
                  className="form-section"
                  initial="initial"
                  animate="animate"
                  variants={staggerContainer}
                >
                  <motion.div className="form-group" variants={fadeInUp}>
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
                  </motion.div>

                  <motion.div className="form-group" variants={fadeInUp}>
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
                  </motion.div>

                  <motion.div 
                    className="rate-display"
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="rate-info">
                      <span className="rate-label">Taux estimé</span>
                      <span className="rate-value">{formData.rate.toFixed(2)}%</span>
                    </div>
                    <span className="profile-badge">{formData.profileLabel}</span>
                  </motion.div>

                  <motion.div 
                    className="insurance-notice"
                    variants={fadeInUp}
                  >
                    <ShieldCheck className="insurance-icon-lucide" size={24} />
                    <div className="insurance-text">
                      <strong>Assurance emprunteur incluse</strong>
                      <span>Taux fixe : {INSURANCE_RATE}% par an (obligatoire)</span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Co-borrower Section */}
                <CoborrowerSection
                  enabled={hasCoborrower}
                  onToggle={setHasCoborrower}
                  data={coborrowerData}
                  onChange={setCoborrowerData}
                />
              </Card>
            </motion.div>

            {/* Results Cards */}
            <AnimatePresence mode="wait">
              {result && result.isValid && (
                <motion.div 
                  className="results-wrapper"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {/* Main Result Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <Card className="result-card main-result" padding="xl">
                      <motion.div 
                        className="result-header"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        Mensualité totale
                      </motion.div>
                      <motion.div 
                        className="result-amount"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                      >
                        {safeFormat(result.monthlyTotal)} €
                        <span className="per-month">/mois</span>
                      </motion.div>
                      <motion.div 
                        className="monthly-breakdown"
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                      >
                        <motion.div className="breakdown-item" variants={fadeInUp}>
                          <span>Crédit</span>
                          <span>{safeFormat(result.monthlyCredit)} €</span>
                        </motion.div>
                        <motion.div className="breakdown-item insurance" variants={fadeInUp}>
                          <span>🛡️ Assurance</span>
                          <span>{safeFormat(result.monthlyInsurance)} €</span>
                        </motion.div>
                      </motion.div>
                    </Card>
                  </motion.div>

                  {/* Project Summary Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    <Card className="result-card" padding="lg">
                      <h3>📊 Récapitulatif du projet</h3>
                      <motion.div 
                        className="summary-rows"
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                      >
                        <motion.div className="summary-row" variants={fadeInUp}>
                          <span>Prix du bien</span>
                          <span>{safeFormat(formData.propertyPrice)} €</span>
                        </motion.div>
                        <motion.div className="summary-row" variants={fadeInUp}>
                          <span>Frais de notaire</span>
                          <span>{safeFormat(formData.notaryFees)} €</span>
                        </motion.div>
                        <motion.div className="summary-row" variants={fadeInUp}>
                          <span>Frais d'agence</span>
                          <span>{safeFormat(formData.agencyFees)} €</span>
                        </motion.div>
                        {formData.worksAmount > 0 && (
                          <motion.div className="summary-row" variants={fadeInUp}>
                            <span>Travaux</span>
                            <span>{safeFormat(formData.worksAmount)} €</span>
                          </motion.div>
                        )}
                        <motion.div className="summary-row highlight" variants={fadeInUp}>
                          <span>Coût total du projet</span>
                          <span>
                            {safeFormat(
                              formData.propertyPrice + formData.notaryFees + 
                              formData.agencyFees + formData.worksAmount
                            )} €
                          </span>
                        </motion.div>
                        <motion.div className="summary-row apport" variants={fadeInUp}>
                          <span>− Apport personnel</span>
                          <span>{safeFormat(formData.downPayment)} €</span>
                        </motion.div>
                        <motion.div className="summary-row total" variants={fadeInUp}>
                          <span>= Capital emprunté</span>
                          <span>{safeFormat(result.loanAmount)} €</span>
                        </motion.div>
                      </motion.div>
                    </Card>
                  </motion.div>

                  {/* Cost Breakdown Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    <Card className="result-card" padding="lg">
                      <h3>💶 Coût du crédit</h3>
                      <motion.div 
                        className="summary-rows"
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                      >
                        <motion.div className="summary-row" variants={fadeInUp}>
                          <span>Durée</span>
                          <span>{formData.durationYears} ans ({result.durationMonths} mois)</span>
                        </motion.div>
                        <motion.div className="summary-row" variants={fadeInUp}>
                          <span>Taux du crédit</span>
                          <span>{formData.rate.toFixed(2)}%</span>
                        </motion.div>
                        <motion.div className="summary-row" variants={fadeInUp}>
                          <span>Coût total des intérêts</span>
                          <span>{safeFormat(result.totalInterest)} €</span>
                        </motion.div>
                        <motion.div className="summary-row insurance-row" variants={fadeInUp}>
                          <span>🛡️ Coût total assurance</span>
                          <span>{safeFormat(result.totalInsurance)} €</span>
                        </motion.div>
                        <motion.div className="summary-row" variants={fadeInUp}>
                          <span>Frais de dossier & garantie</span>
                          <span>{safeFormat(result.bankFees)} €</span>
                        </motion.div>
                        <motion.div className="summary-row total" variants={fadeInUp}>
                          <span>Coût global du crédit</span>
                          <span>{safeFormat(result.totalCost)} €</span>
                        </motion.div>
                        <motion.div className="summary-row taeg" variants={fadeInUp}>
                          <span>TAEG estimé</span>
                          <span>{result.taegEstimate.toFixed(2)}%</span>
                        </motion.div>
                      </motion.div>
                    </Card>
                  </motion.div>

                  {/* CTA Buttons */}
                  <motion.div 
                    className="cta-buttons"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        onClick={handleCreateLoan} 
                        variant="primary" 
                        size="lg"
                        disabled={loading || !result?.isValid}
                      >
                        {loading ? '⏳ Création en cours...' : '📋 Faire une demande de prêt'}
                      </Button>
                    </motion.div>
                    <Button onClick={() => navigate('/how-it-works')} variant="ghost" size="md">
                      Comment ça marche ?
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Invalid simulation message */}
            <AnimatePresence>
              {result && !result.isValid && (
                <motion.div 
                  className="results-wrapper"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="result-card error-card" padding="xl">
                    <motion.div 
                      className="error-icon"
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      ⚠️
                    </motion.div>
                    <h3>Simulation impossible</h3>
                    <p>Veuillez vérifier vos paramètres :</p>
                    <ul>
                      <li>Le capital emprunté doit être positif</li>
                      <li>La durée doit être entre 5 et 30 ans</li>
                      <li>L'apport ne peut pas dépasser le coût total du projet</li>
                    </ul>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </>
  );
};

export default Simulator;
