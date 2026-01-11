import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import { loansApi } from '@/services/api';
import { calculateMonthlyPayment as calcMonthly, calculateTotalInterest } from '@/lib/loanCalculations';

interface FormData {
  amount: number;
  downPayment: number;
  duration: number;
  rate: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  projectType: string;
  propertyAddress: string;
}

const steps = [
  { id: 1, title: 'Projet', icon: '🏠' },
  { id: 2, title: 'Financement', icon: '💰' },
  { id: 3, title: 'Situation', icon: '📋' },
  { id: 4, title: 'Récapitulatif', icon: '✅' },
];

const NewLoanApplication: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    amount: 250000,
    downPayment: 25000,
    duration: 25,
    rate: 3.01,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    projectType: 'achat_residence_principale',
    propertyAddress: '',
  });

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getMonthlyPayment = () => {
    const loanAmount = formData.amount - formData.downPayment;
    const months = formData.duration * 12;
    return calcMonthly(loanAmount, formData.rate, months);
  };

  const getDebtRatio = () => {
    const monthly = getMonthlyPayment();
    if (formData.monthlyIncome <= 0) return 0;
    return ((monthly + formData.monthlyExpenses) / formData.monthlyIncome) * 100;
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('Vous devez être connecté');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const loanAmount = formData.amount - formData.downPayment;
      const monthlyPayment = getMonthlyPayment();
      const debtRatio = getDebtRatio();
      const totalInterest = (monthlyPayment * formData.duration * 12) - loanAmount;

      await loansApi.create({
        user_id: user.id,
        amount: loanAmount,
        duration: formData.duration,
        rate: formData.rate,
        monthly_payment: Math.round(monthlyPayment * 100) / 100,
        monthly_payment_est: Math.round(monthlyPayment * 100) / 100,
        debt_ratio_est: Math.round(debtRatio * 100) / 100,
        total_interest: Math.round(totalInterest * 100) / 100,
        total_amount: Math.round((loanAmount + totalInterest) * 100) / 100,
        status: 'pending',
        is_draft: false,
      });

      navigate('/loans');
    } catch (err) {
      console.error('Error creating loan:', err);
      setError('Erreur lors de la création de votre demande');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2>Votre projet immobilier</h2>
            <p className="step-description">Décrivez votre projet pour que nous puissions vous accompagner au mieux.</p>

            <div className="form-group">
              <label>Type de projet</label>
              <select
                value={formData.projectType}
                onChange={(e) => updateField('projectType', e.target.value)}
              >
                <option value="achat_residence_principale">Achat résidence principale</option>
                <option value="achat_residence_secondaire">Achat résidence secondaire</option>
                <option value="investissement_locatif">Investissement locatif</option>
                <option value="construction">Construction</option>
                <option value="renovation">Rénovation</option>
              </select>
            </div>

            <div className="form-group">
              <label>Montant du bien</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => updateField('amount', Number(e.target.value))}
                min={10000}
                step={5000}
              />
              <span className="input-hint">De 10 000 € à 1 000 000 €</span>
            </div>

            <div className="form-group">
              <label>Adresse du bien (optionnel)</label>
              <input
                type="text"
                value={formData.propertyAddress}
                onChange={(e) => updateField('propertyAddress', e.target.value)}
                placeholder="Ex: 12 rue de la Paix, 75002 Paris"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2>Votre financement</h2>
            <p className="step-description">Définissez les paramètres de votre prêt.</p>

            <div className="form-group">
              <label>Apport personnel</label>
              <input
                type="number"
                value={formData.downPayment}
                onChange={(e) => updateField('downPayment', Number(e.target.value))}
                min={0}
                step={1000}
              />
              <span className="input-hint">
                {((formData.downPayment / formData.amount) * 100).toFixed(0)}% du prix du bien
              </span>
            </div>

            <div className="form-group">
              <label>Durée du prêt (années)</label>
              <input
                type="range"
                value={formData.duration}
                onChange={(e) => updateField('duration', Number(e.target.value))}
                min={5}
                max={30}
              />
              <div className="range-value">{formData.duration} ans</div>
            </div>

            <div className="loan-summary">
              <div className="summary-row">
                <span>Montant emprunté</span>
                <strong>{(formData.amount - formData.downPayment).toLocaleString()} €</strong>
              </div>
              <div className="summary-row">
                <span>Taux estimé</span>
                <strong>{formData.rate.toFixed(2)}%</strong>
              </div>
              <div className="summary-row highlight">
                <span>Mensualité estimée</span>
                <strong>{getMonthlyPayment().toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €/mois</strong>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2>Votre situation financière</h2>
            <p className="step-description">Ces informations nous permettent d'évaluer votre capacité d'emprunt.</p>

            <div className="form-group">
              <label>Revenus mensuels nets (foyer)</label>
              <input
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => updateField('monthlyIncome', Number(e.target.value))}
                min={0}
                step={100}
                placeholder="Ex: 4500"
              />
            </div>

            <div className="form-group">
              <label>Charges mensuelles (crédits en cours)</label>
              <input
                type="number"
                value={formData.monthlyExpenses}
                onChange={(e) => updateField('monthlyExpenses', Number(e.target.value))}
                min={0}
                step={50}
                placeholder="Ex: 500"
              />
            </div>

            {formData.monthlyIncome > 0 && (
              <div className={`debt-ratio-indicator ${getDebtRatio() > 35 ? 'warning' : 'ok'}`}>
                <span className="ratio-label">Taux d'endettement estimé</span>
                <span className="ratio-value">{getDebtRatio().toFixed(1)}%</span>
                <span className="ratio-hint">
                  {getDebtRatio() <= 35 
                    ? '✓ Bon ratio (inférieur à 35%)' 
                    : '⚠️ Ratio élevé (supérieur à 35%)'}
                </span>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2>Récapitulatif de votre demande</h2>
            <p className="step-description">Vérifiez les informations avant de soumettre votre demande.</p>

            <div className="recap-section">
              <h3>🏠 Projet</h3>
              <div className="recap-row">
                <span>Type</span>
                <span>{formData.projectType.replace(/_/g, ' ')}</span>
              </div>
              <div className="recap-row">
                <span>Prix du bien</span>
                <span>{formData.amount.toLocaleString()} €</span>
              </div>
            </div>

            <div className="recap-section">
              <h3>💰 Financement</h3>
              <div className="recap-row">
                <span>Apport</span>
                <span>{formData.downPayment.toLocaleString()} €</span>
              </div>
              <div className="recap-row">
                <span>Montant emprunté</span>
                <span>{(formData.amount - formData.downPayment).toLocaleString()} €</span>
              </div>
              <div className="recap-row">
                <span>Durée</span>
                <span>{formData.duration} ans</span>
              </div>
              <div className="recap-row">
                <span>Taux</span>
                <span>{formData.rate.toFixed(2)}%</span>
              </div>
              <div className="recap-row highlight">
                <span>Mensualité</span>
                <span>{getMonthlyPayment().toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €/mois</span>
              </div>
            </div>

            {formData.monthlyIncome > 0 && (
              <div className="recap-section">
                <h3>📋 Situation</h3>
                <div className="recap-row">
                  <span>Revenus mensuels</span>
                  <span>{formData.monthlyIncome.toLocaleString()} €</span>
                </div>
                <div className="recap-row">
                  <span>Taux d'endettement</span>
                  <span>{getDebtRatio().toFixed(1)}%</span>
                </div>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageLayout>
      <div className="new-loan-page">
        <div className="page-header">
          <div className="container">
            <h1>Nouvelle demande de prêt</h1>
            <p>Remplissez les informations pour soumettre votre dossier</p>
          </div>
        </div>

        <div className="container">
          {/* Progress Steps */}
          <div className="progress-steps fade-in">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`step-item ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}
              >
                <div className="step-icon">{step.icon}</div>
                <span className="step-title">{step.title}</span>
                {index < steps.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>

          <Card className="form-card fade-in" padding="xl">
            {renderStep()}

            <div className="form-actions">
              {currentStep > 1 && (
                <Button variant="ghost" onClick={handleBack} disabled={loading}>
                  ← Retour
                </Button>
              )}
              
              <div className="flex-spacer" />

              {currentStep < steps.length ? (
                <Button variant="primary" onClick={handleNext}>
                  Continuer →
                </Button>
              ) : (
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Envoi en cours...' : 'Soumettre ma demande'}
                </Button>
              )}
            </div>
          </Card>
        </div>

        <style>{`
          .new-loan-page {
            min-height: 100vh;
            background: var(--color-bg);
            padding-bottom: 4rem;
          }

          .page-header {
            background: linear-gradient(135deg, var(--color-primary) 0%, #1e3a5f 100%);
            color: white;
            padding: 3rem 1.5rem;
            margin-bottom: 2rem;
          }

          .page-header h1 {
            color: white;
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }

          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 0 1.5rem;
          }

          .progress-steps {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2rem;
            padding: 0 1rem;
          }

          .step-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            flex: 1;
          }

          .step-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            border: 2px solid var(--color-border);
            margin-bottom: 0.5rem;
            transition: all 0.3s;
          }

          .step-item.active .step-icon {
            border-color: var(--color-primary);
            background: var(--color-primary);
            color: white;
          }

          .step-item.current .step-icon {
            box-shadow: 0 0 0 4px rgba(254, 66, 180, 0.2);
          }

          .step-title {
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--color-text-tertiary);
          }

          .step-item.active .step-title {
            color: var(--color-primary);
          }

          .step-connector {
            position: absolute;
            top: 24px;
            left: 50%;
            width: 100%;
            height: 2px;
            background: var(--color-border);
            z-index: -1;
          }

          .step-item.active .step-connector {
            background: var(--color-primary);
          }

          .form-card {
            margin-bottom: 2rem;
          }

          .step-content h2 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
          }

          .step-description {
            color: var(--color-text-secondary);
            margin-bottom: 2rem;
          }

          .form-group {
            margin-bottom: 1.5rem;
          }

          .form-group label {
            display: block;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--color-text);
          }

          .input-hint {
            display: block;
            font-size: 0.8rem;
            color: var(--color-text-tertiary);
            margin-top: 0.25rem;
          }

          .range-value {
            text-align: center;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--color-primary);
            margin-top: 0.5rem;
          }

          .loan-summary {
            background: #f8fafc;
            border-radius: var(--radius-md);
            padding: 1.5rem;
            margin-top: 2rem;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--color-border);
          }

          .summary-row:last-child {
            border-bottom: none;
          }

          .summary-row.highlight {
            color: var(--color-primary);
            font-size: 1.1rem;
          }

          .debt-ratio-indicator {
            padding: 1.5rem;
            border-radius: var(--radius-md);
            margin-top: 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }

          .debt-ratio-indicator.ok {
            background: #d1fae5;
            color: #065f46;
          }

          .debt-ratio-indicator.warning {
            background: #fef3c7;
            color: #92400e;
          }

          .ratio-value {
            font-size: 2rem;
            font-weight: 700;
          }

          .ratio-hint {
            font-size: 0.85rem;
          }

          .recap-section {
            margin-bottom: 1.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid var(--color-border);
          }

          .recap-section h3 {
            font-size: 1rem;
            margin-bottom: 1rem;
          }

          .recap-row {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
          }

          .recap-row.highlight {
            font-weight: 600;
            color: var(--color-primary);
          }

          .form-actions {
            display: flex;
            align-items: center;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid var(--color-border);
          }

          .flex-spacer {
            flex: 1;
          }

          .error-message {
            background: #fee2e2;
            color: #991b1b;
            padding: 1rem;
            border-radius: var(--radius-md);
            margin-top: 1rem;
          }

          .fade-in {
            animation: fadeIn 0.4s ease-out forwards;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @media (max-width: 768px) {
            .step-title {
              display: none;
            }
          }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default NewLoanApplication;
