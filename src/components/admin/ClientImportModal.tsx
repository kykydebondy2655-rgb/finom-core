import React, { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { adminApi } from '../../services/api';

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

// Function to parse CSV line properly, handling quoted fields
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else if (char === ';' && !inQuotes) {
      // Also support semicolon as delimiter (common in French CSVs)
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

// Function to clean and parse numeric values
const parseNumericValue = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  
  // Remove spaces, € symbol, and other non-numeric characters except dots and commas
  const cleaned = value
    .replace(/\s/g, '')
    .replace(/€/g, '')
    .replace(/EUR/gi, '')
    .replace(/,/g, '.') // Replace comma with dot for decimal
    .trim();
  
  // Extract numeric value
  const match = cleaned.match(/[\d.]+/);
  if (!match) return undefined;
  
  const parsed = parseFloat(match[0]);
  return isNaN(parsed) ? undefined : parsed;
};

// Function to format down payment for storage (keeps as string but cleaned)
const formatDownPayment = (value: string | undefined): string | undefined => {
  const numericValue = parseNumericValue(value);
  return numericValue !== undefined ? numericValue.toString() : undefined;
};

export const ClientImportModal: React.FC<ClientImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [parsedLeads, setParsedLeads] = useState<ParsedLead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
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
        // Handle different line endings (Windows: \r\n, Unix: \n, Old Mac: \r)
        const lines = text.split(/\r\n|\n|\r/).filter(line => line.trim());
        
        if (lines.length < 2) {
          setError('Le fichier doit contenir au moins une ligne de données');
          return;
        }

        // Parse header line
        const headerValues = parseCSVLine(lines[0].toLowerCase());
        
        // Find column indices (more flexible matching)
        const findIndex = (patterns: string[]): number => {
          return headerValues.findIndex(h => 
            patterns.some(p => h.includes(p))
          );
        };

        const emailIdx = findIndex(['email', 'mail', 'e-mail']);
        const firstNameIdx = findIndex(['prenom', 'prénom', 'first_name', 'firstname']);
        const lastNameIdx = headerValues.findIndex(h => 
          (h.includes('nom') && !h.includes('prenom') && !h.includes('prénom')) || 
          h.includes('last_name') || 
          h.includes('lastname')
        );
        const phoneIdx = findIndex(['phone', 'tel', 'téléphone', 'telephone', 'mobile']);
        const propertyPriceIdx = findIndex(['property_price', 'prix', 'prix_bien', 'prix du bien', 'montant']);
        const downPaymentIdx = findIndex(['down_payment', 'apport', 'apport_personnel']);
        const purchaseTypeIdx = findIndex(['purchase_type', 'type', 'type_achat']);
        const sourceIdx = findIndex(['source', 'origine']);
        const pipelineIdx = findIndex(['pipeline', 'stage', 'étape']);

        console.log('CSV Headers found:', headerValues);
        console.log('Column indices:', { emailIdx, firstNameIdx, lastNameIdx, phoneIdx, propertyPriceIdx, downPaymentIdx, purchaseTypeIdx, sourceIdx, pipelineIdx });

        if (emailIdx === -1 || firstNameIdx === -1 || lastNameIdx === -1) {
          setError('Le CSV doit contenir: email, prénom/first_name, nom/last_name. Colonnes trouvées: ' + headerValues.join(', '));
          return;
        }

        const leads: ParsedLead[] = [];
        const parseErrors: string[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          try {
            const values = parseCSVLine(lines[i]);
            
            // Clean values - remove surrounding quotes
            const cleanValue = (idx: number): string => {
              if (idx === -1 || idx >= values.length) return '';
              return values[idx].replace(/^"|"$/g, '').trim();
            };
            
            const email = cleanValue(emailIdx);
            
            // Skip empty lines or lines without email
            if (!email || !email.includes('@')) {
              if (email) {
                parseErrors.push(`Ligne ${i + 1}: email invalide "${email}"`);
              }
              continue;
            }
            
            const lead: ParsedLead = {
              email: email.toLowerCase(),
              firstName: cleanValue(firstNameIdx),
              lastName: cleanValue(lastNameIdx),
              phone: phoneIdx !== -1 ? cleanValue(phoneIdx) || undefined : undefined,
              propertyPrice: propertyPriceIdx !== -1 ? parseNumericValue(cleanValue(propertyPriceIdx)) : undefined,
              downPayment: downPaymentIdx !== -1 ? formatDownPayment(cleanValue(downPaymentIdx)) : undefined,
              purchaseType: purchaseTypeIdx !== -1 ? cleanValue(purchaseTypeIdx) || undefined : undefined,
              source: sourceIdx !== -1 ? cleanValue(sourceIdx) || undefined : undefined,
              pipelineStage: pipelineIdx !== -1 ? cleanValue(pipelineIdx) || undefined : undefined
            };
            
            leads.push(lead);
          } catch (lineErr) {
            parseErrors.push(`Ligne ${i + 1}: erreur de parsing`);
            console.error(`Error parsing line ${i + 1}:`, lineErr);
          }
        }

        if (leads.length === 0) {
          setError('Aucun lead valide trouvé. ' + (parseErrors.length > 0 ? 'Erreurs: ' + parseErrors.slice(0, 3).join('; ') : ''));
          return;
        }

        console.log(`Successfully parsed ${leads.length} leads from ${lines.length - 1} data lines`);
        if (parseErrors.length > 0) {
          console.warn('Parse warnings:', parseErrors);
        }

        setParsedLeads(leads);
        setError(null);
        setStep('preview');
      } catch (err) {
        console.error('File parsing error:', err);
        setError('Erreur lors de la lecture du fichier: ' + (err instanceof Error ? err.message : 'Erreur inconnue'));
      }
    };
    reader.readAsText(file, 'UTF-8');
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
        const errorMsg = err.message || 'Erreur inconnue';
        importResults.errors.push(`${lead.email}: ${errorMsg}`);
        console.error(`Failed to import lead ${lead.email}:`, err);
      }
    }

    setResults(importResults);
    setStep('result');
    setImporting(false);
    if (importResults.success > 0) onSuccess();
  };

  const resetModal = () => {
    setStep('upload');
    setParsedLeads([]);
    setError(null);
    setResults({ success: 0, failed: 0, errors: [] });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '700px',
        width: '95%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>Import de leads CSV</h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            color: '#dc2626'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '14px' }}>{error}</span>
          </div>
        )}

        {step === 'upload' && (
          <div>
            <p style={{ color: '#64748b', marginBottom: '16px', fontSize: '14px' }}>
              Téléchargez un fichier CSV avec les colonnes: <strong>email, prénom, nom</strong><br />
              Colonnes optionnelles: téléphone, prix du bien, apport, type d'achat, source, pipeline
            </p>
            
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '13px', color: '#0369a1' }}>
                📄 Besoin d'un modèle ? Téléchargez notre fichier exemple
              </span>
              <a
                href="/templates/leads-template.csv"
                download="leads-template.csv"
                style={{
                  backgroundColor: '#0ea5e9',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Download size={14} />
                Télécharger le modèle
              </a>
            </div>
            
            <div style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center'
            }}>
              <Upload size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                style={{
                  backgroundColor: '#f97316',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'inline-block',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Sélectionner un fichier CSV
              </label>
              <p style={{ color: '#94a3b8', marginTop: '12px', fontSize: '12px' }}>
                Formats supportés: virgule (,) ou point-virgule (;) comme séparateur
              </p>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div>
            <p style={{ color: '#64748b', marginBottom: '16px', fontSize: '14px' }}>
              <strong>{parsedLeads.length}</strong> leads prêts à être importés
            </p>
            <div style={{ maxHeight: '300px', overflow: 'auto', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Email</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Nom</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Prix bien</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Apport</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedLeads.slice(0, 10).map((lead, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{lead.email}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{lead.firstName} {lead.lastName}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>
                        {lead.propertyPrice ? `${lead.propertyPrice.toLocaleString('fr-FR')} €` : '-'}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>
                        {lead.downPayment ? `${parseFloat(lead.downPayment).toLocaleString('fr-FR')} €` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedLeads.length > 10 && (
                <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>
                  ... et {parsedLeads.length - 10} autres leads
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={resetModal}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                style={{
                  padding: '10px 20px',
                  backgroundColor: importing ? '#94a3b8' : '#f97316',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: importing ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                {importing ? 'Import en cours...' : `Importer ${parsedLeads.length} leads`}
              </button>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              {results.success > 0 ? (
                <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto 12px' }} />
              ) : (
                <AlertCircle size={48} color="#dc2626" style={{ margin: '0 auto 12px' }} />
              )}
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>Import terminé</h3>
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#22c55e' }}>{results.success}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Réussis</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626' }}>{results.failed}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Échoués</div>
              </div>
            </div>
            {results.errors.length > 0 && (
              <div style={{
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
                maxHeight: '150px',
                overflow: 'auto'
              }}>
                <p style={{ fontWeight: 600, color: '#dc2626', fontSize: '13px', marginBottom: '8px' }}>Détails des erreurs:</p>
                {results.errors.slice(0, 10).map((err, idx) => (
                  <p key={idx} style={{ fontSize: '12px', color: '#b91c1c', marginBottom: '4px' }}>• {err}</p>
                ))}
                {results.errors.length > 10 && (
                  <p style={{ fontSize: '12px', color: '#b91c1c', fontStyle: 'italic' }}>
                    ... et {results.errors.length - 10} autres erreurs
                  </p>
                )}
              </div>
            )}
            <button
              onClick={handleClose}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientImportModal;
