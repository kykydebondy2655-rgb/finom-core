import React from 'react';
import Card from '@/components/finom/Card';

export interface CoborrowerData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  profession: string;
  employmentType: string;
  monthlyIncome: number;
  monthlyCharges: number;
}

interface CoborrowerSectionProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  data: CoborrowerData;
  onChange: (data: CoborrowerData) => void;
  readOnly?: boolean;
}

const emptyCoborrower: CoborrowerData = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  phone: '',
  email: '',
  profession: '',
  employmentType: '',
  monthlyIncome: 0,
  monthlyCharges: 0
};

export const CoborrowerSection: React.FC<CoborrowerSectionProps> = ({
  enabled,
  onToggle,
  data,
  onChange,
  readOnly = false
}) => {
  const handleChange = (field: keyof CoborrowerData, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="coborrower-section">
      <div className="coborrower-toggle">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => {
              onToggle(e.target.checked);
              if (!e.target.checked) {
                onChange(emptyCoborrower);
              }
            }}
            disabled={readOnly}
          />
          <span className="toggle-text">
            <strong>Ajouter un co-emprunteur</strong>
            <small>Ajoutez les informations d'un co-emprunteur pour renforcer votre dossier</small>
          </span>
        </label>
      </div>

      {enabled && (
        <Card className="coborrower-form fade-in" padding="lg">
          <h3>👥 Informations du co-emprunteur</h3>
          
          <div className="form-section">
            <h4>Identité</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Prénom *</label>
                <input
                  type="text"
                  value={data.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="form-input"
                  placeholder="Prénom"
                  required
                  disabled={readOnly}
                />
              </div>
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  value={data.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="form-input"
                  placeholder="Nom"
                  required
                  disabled={readOnly}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Date de naissance *</label>
                <input
                  type="date"
                  value={data.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  className="form-input"
                  required
                  disabled={readOnly}
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="form-input"
                  placeholder="+33 6 12 34 56 78"
                  disabled={readOnly}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="form-input"
                placeholder="email@example.com"
                disabled={readOnly}
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Situation professionnelle</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Profession</label>
                <input
                  type="text"
                  value={data.profession}
                  onChange={(e) => handleChange('profession', e.target.value)}
                  className="form-input"
                  placeholder="Ex: Ingénieur"
                  disabled={readOnly}
                />
              </div>
              <div className="form-group">
                <label>Type de contrat</label>
                <select
                  value={data.employmentType}
                  onChange={(e) => handleChange('employmentType', e.target.value)}
                  className="form-input"
                  disabled={readOnly}
                >
                  <option value="">Sélectionner...</option>
                  <option value="cdi">CDI</option>
                  <option value="cdd">CDD</option>
                  <option value="fonctionnaire">Fonctionnaire</option>
                  <option value="independant">Indépendant</option>
                  <option value="retraite">Retraité</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Revenus & Charges</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Revenus mensuels nets (€)</label>
                <input
                  type="number"
                  value={data.monthlyIncome || ''}
                  onChange={(e) => handleChange('monthlyIncome', parseFloat(e.target.value) || 0)}
                  className="form-input"
                  placeholder="3000"
                  min="0"
                  disabled={readOnly}
                />
              </div>
              <div className="form-group">
                <label>Charges mensuelles (€)</label>
                <input
                  type="number"
                  value={data.monthlyCharges || ''}
                  onChange={(e) => handleChange('monthlyCharges', parseFloat(e.target.value) || 0)}
                  className="form-input"
                  placeholder="500"
                  min="0"
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CoborrowerSection;