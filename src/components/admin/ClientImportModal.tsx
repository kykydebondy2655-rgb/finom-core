import React, { useState, useRef, useEffect } from 'react';
import Button from '@/components/finom/Button';
import { adminApi, Profile } from '@/services/api';
import logger from '@/lib/logger';

interface ClientImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedLead {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  propertyPrice?: number;
  downPayment?: string;
  purchaseType?: string;
  source?: string;
  pipelineStage?: string;
}

const ClientImportModal: React.FC<ClientImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedLeads, setParsedLeads] = useState<ParsedLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] }>({ success: 0, failed: 0, errors: [] });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      setError('Veuillez sélectionner un fichier CSV');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setError('Le fichier doit contenir au moins une ligne de données');
          return;
        }

        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const emailIdx = headers.findIndex(h => h.includes('email'));
        const firstNameIdx = headers.findIndex(h => h.includes('prenom') || h.includes('first'));
        const lastNameIdx = headers.findIndex(h => h.includes('nom') && !h.includes('prenom'));
        const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('tel'));
        const propertyPriceIdx = headers.findIndex(h => h.includes('property_price') || h.includes('prix'));
        const downPaymentIdx = headers.findIndex(h => h.includes('down_payment') || h.includes('apport'));
        const purchaseTypeIdx = headers.findIndex(h => h.includes('purchase_type') || h.includes('type'));
        const sourceIdx = headers.findIndex(h => h.includes('source'));
        const pipelineIdx = headers.findIndex(h => h.includes('pipeline'));

        if (emailIdx === -1 || firstNameIdx === -1 || lastNameIdx === -1) {
          setError('Le CSV doit contenir: email, prénom/first_name, nom/last_name');
          return;
        }

        const leads: ParsedLead[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          if (values[emailIdx]) {
            leads.push({
              email: values[emailIdx],
              firstName: values[firstNameIdx] || '',
              lastName: values[lastNameIdx] || '',
              phone: phoneIdx !== -1 ? values[phoneIdx] : undefined,
              propertyPrice: propertyPriceIdx !== -1 ? parseFloat(values[propertyPriceIdx]) || undefined : undefined,
              downPayment: downPaymentIdx !== -1 ? values[downPaymentIdx] : undefined,
              purchaseType: purchaseTypeIdx !== -1 ? values[purchaseTypeIdx] : undefined,
              source: sourceIdx !== -1 ? values[sourceIdx] : undefined,
              pipelineStage: pipelineIdx !== -1 ? values[pipelineIdx] : undefined
            });
          }
        }

        if (leads.length === 0) {
          setError('Aucun lead valide trouvé');
          return;
        }

        setParsedLeads(leads);
        setError(null);
        setStep('preview');
      } catch (err) {
        setError('Erreur lors de la lecture du fichier');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setImporting(true);
    setError(null);
    const importResults = { success: 0, failed: 0, errors: [] as string[] };
    
    for (const lead of parsedLeads) {
      try {
        await adminApi.createLead(lead);
        importResults.success++;
      } catch (err: any) {
        importResults.failed++;
        importResults.errors.push(`${lead.email}: ${err.message}`);
      }
    }

    setResults(importResults);
    setStep('result');
    setImporting(false);
    if (importResults.success > 0) onSuccess();
  };

  const resetModal = () => {
    setParsedLeads([]);
    setError(null);
    setStep('upload');
    setResults({ success: 0, failed: 0, errors: [] });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => { resetModal(); onClose(); };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{step === 'upload' ? 'Importer des leads (CSV)' : step === 'preview' ? `Aperçu - ${parsedLeads.length} leads` : "Résultat de l'import"}</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          
          {step === 'upload' && (
            <div className="upload-section">
              <div className="upload-info">
                <h3>Format CSV attendu</h3>
                <p>Colonnes supportées :</p>
                <ul>
                  <li><strong>email</strong>, <strong>prenom</strong>, <strong>nom</strong> (requis)</li>
                  <li>telephone, property_price, down_payment, purchase_type, source, pipeline_stage</li>
                </ul>
                <div className="example-csv">
                  <code>nom,prenom,telephone,email,property_price,down_payment,purchase_type,source,pipeline_stage<br/>Dupont,Jean,0612345678,jean@test.fr,250000,10000,Ancien,acb,Promesse signée</code>
                </div>
              </div>
              <div className="file-input-wrapper">
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} id="csv-upload" />
                <label htmlFor="csv-upload" className="file-label">📁 Sélectionner un fichier CSV</label>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="preview-section">
              <div className="clients-table-wrapper">
                <table className="clients-table">
                  <thead><tr><th>Email</th><th>Nom</th><th>Prix bien</th><th>Apport</th><th>Source</th></tr></thead>
                  <tbody>
                    {parsedLeads.map((lead, i) => (
                      <tr key={i}>
                        <td>{lead.email}</td>
                        <td>{lead.firstName} {lead.lastName}</td>
                        <td>{lead.propertyPrice?.toLocaleString() || '-'}</td>
                        <td>{lead.downPayment || '-'}</td>
                        <td>{lead.source || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-actions">
                <Button variant="ghost" onClick={() => setStep('upload')}>Retour</Button>
                <Button variant="primary" onClick={handleImport} disabled={importing}>
                  {importing ? 'Import...' : `Importer ${parsedLeads.length} leads`}
                </Button>
              </div>
            </div>
          )}

          {step === 'result' && (
            <div className="result-section">
              <div className="result-summary">
                <div className="result-stat success"><span className="stat-number">{results.success}</span><span>Créés</span></div>
                <div className="result-stat failed"><span className="stat-number">{results.failed}</span><span>Échecs</span></div>
              </div>
              {results.errors.length > 0 && <div className="errors-list"><h4>Erreurs:</h4><ul>{results.errors.map((e,i) => <li key={i}>{e}</li>)}</ul></div>}
              <div className="modal-actions"><Button variant="primary" onClick={handleClose}>Fermer</Button></div>
            </div>
          )}
        </div>
        <style>{`
          .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
          .modal-content { background: var(--color-bg); border-radius: 16px; width: 90%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
          .modal-content.large { max-width: 800px; }
          .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid var(--color-border); }
          .modal-header h2 { margin: 0; font-size: 1.25rem; }
          .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
          .modal-body { padding: 1.5rem; }
          .error-message { background: #fef2f2; color: #dc2626; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; }
          .upload-info { margin-bottom: 1.5rem; padding: 1rem; background: var(--color-muted); border-radius: 8px; }
          .upload-info h3 { margin: 0 0 0.5rem; }
          .upload-info ul { margin: 0.5rem 0; padding-left: 1.5rem; }
          .example-csv { margin-top: 1rem; padding: 0.75rem; background: var(--color-bg); border-radius: 4px; font-family: monospace; font-size: 0.75rem; overflow-x: auto; }
          .file-input-wrapper { text-align: center; }
          .file-input-wrapper input { display: none; }
          .file-label { display: inline-block; padding: 1rem 2rem; background: var(--color-admin); color: white; border-radius: 8px; cursor: pointer; }
          .clients-table-wrapper { max-height: 300px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: 8px; }
          .clients-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
          .clients-table th, .clients-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--color-border); }
          .clients-table th { background: var(--color-muted); position: sticky; top: 0; }
          .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
          .result-summary { display: flex; gap: 2rem; justify-content: center; margin-bottom: 1.5rem; }
          .result-stat { text-align: center; padding: 1.5rem 2rem; border-radius: 12px; }
          .result-stat.success { background: #dcfce7; color: #16a34a; }
          .result-stat.failed { background: #fef2f2; color: #dc2626; }
          .stat-number { display: block; font-size: 2rem; font-weight: 700; }
          .errors-list { background: #fef2f2; padding: 1rem; border-radius: 8px; }
          .errors-list ul { margin: 0; padding-left: 1.5rem; font-size: 0.8rem; }
        `}</style>
      </div>
    </div>
  );
};

export default ClientImportModal;
