import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Card from '../components/finom/Card';
import Button from '../components/finom/Button';

// Rate calculation based on profile
const getRateForProfile = (duration: number, contributionPercent: number) => {
    let profile = 'standard';
    let rate = 3.01;
    
    if (contributionPercent >= 0.20) {
        profile = 'excellent';
        rate = 2.75;
    } else if (contributionPercent >= 0.10) {
        profile = 'good';
        rate = 2.95;
    }
    
    if (duration <= 15) rate -= 0.15;
    else if (duration >= 25) rate += 0.20;
    
    return { rate: Math.max(rate, 2.50), profile };
};

const Simulator = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        amount: 250000,
        downPayment: 30000,
        duration: 25,
        rate: 3.01,
        includeInsurance: true,
        profile: 'standard'
    });

    const [result, setResult] = useState<any>(null);

    const config = {
        min_amount: 10000,
        max_amount: 1000000,
        min_duration: 5,
        max_duration: 30,
        insurance_rate: 0.36,
        origination_fee: 500,
        guarantee_rate: 1.2
    };

    useEffect(() => {
        calculate();
    }, [formData.amount, formData.downPayment, formData.duration, formData.includeInsurance]);

    const calculate = () => {
        let computedRate = formData.rate;
        let profile = 'standard';

        if (formData.amount > 0) {
            const contributionPercent = formData.downPayment / formData.amount;
            const rateData = getRateForProfile(formData.duration, contributionPercent);
            computedRate = rateData.rate;
            profile = rateData.profile;
        }

        if (computedRate !== formData.rate || profile !== formData.profile) {
            setFormData(prev => ({ ...prev, rate: computedRate, profile }));
        }

        const loanAmount = Math.max(0, formData.amount - formData.downPayment);
        const durationMonths = formData.duration * 12;
        const monthlyRate = computedRate / 100 / 12;
        
        let monthlyPaymentNoIns = 0;
        if (monthlyRate > 0) {
            monthlyPaymentNoIns = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -durationMonths));
        } else {
            monthlyPaymentNoIns = loanAmount / durationMonths;
        }

        let monthlyInsurance = 0;
        if (formData.includeInsurance) {
            monthlyInsurance = (loanAmount * (config.insurance_rate / 100)) / 12;
        }

        const guaranteeFee = loanAmount * (config.guarantee_rate / 100);
        const totalFees = config.origination_fee + guaranteeFee;
        const totalMonthlyPayment = monthlyPaymentNoIns + monthlyInsurance;
        const totalInterest = (monthlyPaymentNoIns * durationMonths) - loanAmount;
        const totalInsurance = monthlyInsurance * durationMonths;
        const totalCost = totalInterest + totalInsurance + totalFees;
        const taegEst = computedRate + (formData.includeInsurance ? config.insurance_rate : 0) + 0.2;

        setResult({
            loanAmount,
            monthlyPayment: totalMonthlyPayment.toFixed(2),
            monthlyInsurance: monthlyInsurance.toFixed(2),
            totalInterest: totalInterest.toFixed(2),
            totalInsurance: totalInsurance.toFixed(2),
            totalFees: totalFees.toFixed(2),
            totalCost: totalCost.toFixed(2),
            taeg: taegEst.toFixed(2)
        });
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
                    <div className="simulator-grid">
                        <Card className="form-card fade-in" padding="xl">
                            <h2>Votre simulation</h2>
                            
                            <div className="form-group">
                                <label>Montant du bien</label>
                                <input
                                    type="range"
                                    min={config.min_amount}
                                    max={config.max_amount}
                                    step={5000}
                                    value={formData.amount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                                />
                                <div className="value-display">{formData.amount.toLocaleString()} €</div>
                            </div>

                            <div className="form-group">
                                <label>Apport personnel</label>
                                <input
                                    type="range"
                                    min={0}
                                    max={formData.amount * 0.5}
                                    step={1000}
                                    value={formData.downPayment}
                                    onChange={(e) => setFormData(prev => ({ ...prev, downPayment: Number(e.target.value) }))}
                                />
                                <div className="value-display">
                                    {formData.downPayment.toLocaleString()} € 
                                    <span className="percent">({((formData.downPayment / formData.amount) * 100).toFixed(0)}%)</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Durée du prêt</label>
                                <input
                                    type="range"
                                    min={config.min_duration}
                                    max={config.max_duration}
                                    step={1}
                                    value={formData.duration}
                                    onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                                />
                                <div className="value-display">{formData.duration} ans</div>
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.includeInsurance}
                                        onChange={(e) => setFormData(prev => ({ ...prev, includeInsurance: e.target.checked }))}
                                    />
                                    Inclure l'assurance emprunteur ({config.insurance_rate}%)
                                </label>
                            </div>

                            <div className="rate-display">
                                <span className="rate-label">Taux estimé</span>
                                <span className="rate-value">{formData.rate.toFixed(2)}%</span>
                                <span className="profile-badge">{formData.profile}</span>
                            </div>
                        </Card>

                        {result && (
                            <div className="results-wrapper fade-in">
                                <Card className="result-card main-result" padding="xl">
                                    <div className="result-label">Mensualité estimée</div>
                                    <div className="result-amount">{parseFloat(result.monthlyPayment).toLocaleString()} €<span>/mois</span></div>
                                    {formData.includeInsurance && (
                                        <div className="insurance-detail">dont {parseFloat(result.monthlyInsurance).toLocaleString()} € d'assurance</div>
                                    )}
                                </Card>

                                <Card className="result-card" padding="lg">
                                    <div className="result-row">
                                        <span>Montant emprunté</span>
                                        <span>{result.loanAmount.toLocaleString()} €</span>
                                    </div>
                                    <div className="result-row">
                                        <span>Coût total des intérêts</span>
                                        <span>{parseFloat(result.totalInterest).toLocaleString()} €</span>
                                    </div>
                                    {formData.includeInsurance && (
                                        <div className="result-row">
                                            <span>Coût total assurance</span>
                                            <span>{parseFloat(result.totalInsurance).toLocaleString()} €</span>
                                        </div>
                                    )}
                                    <div className="result-row">
                                        <span>Frais de dossier</span>
                                        <span>{parseFloat(result.totalFees).toLocaleString()} €</span>
                                    </div>
                                    <div className="result-row total">
                                        <span>Coût total du crédit</span>
                                        <span>{parseFloat(result.totalCost).toLocaleString()} €</span>
                                    </div>
                                    <div className="result-row taeg">
                                        <span>TAEG estimé</span>
                                        <span>{result.taeg}%</span>
                                    </div>
                                </Card>

                                <div className="cta-buttons">
                                    <Button onClick={() => navigate('/register')} variant="primary" size="lg">
                                        Démarrer ma demande
                                    </Button>
                                    <Button onClick={() => navigate('/how-it-works')} variant="ghost" size="md">
                                        Comment ça marche ?
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <style>{`
                    .simulator-page {
                        background-color: #F3F6F6;
                        min-height: 100vh;
                        padding-bottom: 6rem;
                    }
                    .hero-simulator {
                        position: relative;
                        padding: 8rem 0 10rem;
                        background: var(--color-secondary);
                        color: white;
                        margin-bottom: -120px;
                    }
                    .badge-hero {
                        display: inline-block;
                        background: var(--color-primary);
                        color: white;
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
                        color: rgba(255,255,255,0.7);
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
                    .simulator-grid {
                        display: grid;
                        grid-template-columns: 1.5fr 1fr;
                        gap: 3rem;
                        align-items: start;
                    }
                    .form-card h2 {
                        margin-bottom: 2rem;
                        color: var(--color-text);
                    }
                    .form-group {
                        margin-bottom: 2rem;
                    }
                    .form-group label {
                        display: block;
                        font-weight: 600;
                        margin-bottom: 0.5rem;
                        color: var(--color-text);
                    }
                    .form-group input[type="range"] {
                        width: 100%;
                        height: 8px;
                        border-radius: 4px;
                        background: #e2e8f0;
                        appearance: none;
                        cursor: pointer;
                    }
                    .form-group input[type="range"]::-webkit-slider-thumb {
                        appearance: none;
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: var(--color-primary);
                        cursor: pointer;
                    }
                    .value-display {
                        margin-top: 0.5rem;
                        font-size: 1.5rem;
                        font-weight: 700;
                        color: var(--color-primary);
                    }
                    .value-display .percent {
                        font-size: 0.9rem;
                        color: var(--color-text-secondary);
                        margin-left: 0.5rem;
                    }
                    .checkbox-group label {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        cursor: pointer;
                    }
                    .checkbox-group input[type="checkbox"] {
                        width: 18px;
                        height: 18px;
                    }
                    .rate-display {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        padding: 1rem;
                        background: #f8fafc;
                        border-radius: var(--radius-md);
                        margin-top: 1rem;
                    }
                    .rate-label {
                        color: var(--color-text-secondary);
                    }
                    .rate-value {
                        font-size: 1.5rem;
                        font-weight: 700;
                        color: var(--color-secondary);
                    }
                    .profile-badge {
                        background: var(--color-secondary);
                        color: white;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        text-transform: uppercase;
                    }
                    .results-wrapper {
                        display: flex;
                        flex-direction: column;
                        gap: 1.5rem;
                    }
                    .result-card.main-result {
                        background: linear-gradient(135deg, var(--color-primary) 0%, #1e3a5f 100%);
                        color: white;
                        text-align: center;
                    }
                    .result-label {
                        font-size: 0.9rem;
                        opacity: 0.9;
                        margin-bottom: 0.5rem;
                    }
                    .result-amount {
                        font-size: 3rem;
                        font-weight: 700;
                    }
                    .result-amount span {
                        font-size: 1.25rem;
                        font-weight: 400;
                        opacity: 0.8;
                    }
                    .insurance-detail {
                        font-size: 0.85rem;
                        opacity: 0.8;
                        margin-top: 0.5rem;
                    }
                    .result-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 0.75rem 0;
                        border-bottom: 1px solid var(--color-border);
                    }
                    .result-row:last-child {
                        border-bottom: none;
                    }
                    .result-row.total {
                        font-weight: 700;
                        font-size: 1.1rem;
                        color: var(--color-primary);
                    }
                    .result-row.taeg {
                        color: var(--color-secondary);
                        font-weight: 600;
                    }
                    .cta-buttons {
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                    }
                    @media (max-width: 1024px) {
                        .hero-simulator { padding: 4rem 0 8rem; }
                        .simulator-grid { grid-template-columns: 1fr; gap: 2rem; }
                        .hero-content h1 { font-size: 2.5rem; }
                    }
                    .fade-in {
                        animation: fadeIn 0.4s ease-out forwards;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        </>
    );
};

export default Simulator;
