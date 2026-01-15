import React, { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { adminApi, importsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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

// Validation functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): { valid: boolean; formatted: string | undefined } => {
  if (!phone) return { valid: true, formatted: undefined };
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // French phone formats: 0612345678, +33612345678, 0033612345678
  if (/^0[1-9]\d{8}$/.test(cleaned)) {
    return { valid: true, formatted: cleaned };
  }
  if (/^\+33[1-9]\d{8}$/.test(cleaned)) {
    return { valid: true, formatted: cleaned };
  }
  if (/^0033[1-9]\d{8}$/.test(cleaned)) {
    return { valid: true, formatted: '+33' + cleaned.slice(4) };
  }
  // International format (at least 8 digits with +)
  if (/^\+\d{8,15}$/.test(cleaned)) {
    return { valid: true, formatted: cleaned };
  }
  // Just digits, at least 8
  if (/^\d{8,15}$/.test(cleaned)) {
    return { valid: true, formatted: cleaned };
  }
  
  return { valid: false, formatted: undefined };
};

interface ValidationWarning {
  line: number;
  field: string;
  value: string;
  message: string;
}

interface ParsedLeadWithWarnings extends ParsedLead {
  lineNumber: number;
  warnings: ValidationWarning[];
}

export const ClientImportModal: React.FC<ClientImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [parsedLeads, setParsedLeads] = useState<ParsedLeadWithWarnings[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[]>([]);
  const [skippedLines, setSkippedLines] = useState<{ line: number; reason: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [importMode, setImportMode] = useState<'direct' | 'pending'>('pending');
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] }>({ success: 0, failed: 0, errors: [] });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      setError('Veuillez sélectionner un fichier CSV');
      return;
    }

    setFileName(file.name);

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

        const leads: ParsedLeadWithWarnings[] = [];
        const skipped: { line: number; reason: string }[] = [];
        const allWarnings: ValidationWarning[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          try {
            const values = parseCSVLine(lines[i]);
            const lineWarnings: ValidationWarning[] = [];
            
            // Clean values - remove surrounding quotes
            const cleanValue = (idx: number): string => {
              if (idx === -1 || idx >= values.length) return '';
              return values[idx].replace(/^"|"$/g, '').trim();
            };
            
            const rawEmail = cleanValue(emailIdx);
            const email = rawEmail.toLowerCase();
            
            // Skip empty lines
            if (!rawEmail) {
              continue;
            }
            
            // Validate email
            if (!isValidEmail(email)) {
              skipped.push({ line: i + 1, reason: `Email invalide: "${rawEmail}"` });
              continue;
            }
            
            // Validate and format phone
            const rawPhone = phoneIdx !== -1 ? cleanValue(phoneIdx) : '';
            const phoneValidation = isValidPhone(rawPhone);
            
            if (rawPhone && !phoneValidation.valid) {
              lineWarnings.push({
                line: i + 1,
                field: 'Téléphone',
                value: rawPhone,
                message: 'Format de téléphone non reconnu'
              });
            }
            
            // Validate required fields
            const firstName = cleanValue(firstNameIdx);
            const lastName = cleanValue(lastNameIdx);
            
            if (!firstName) {
              lineWarnings.push({
                line: i + 1,
                field: 'Prénom',
                value: '',
                message: 'Prénom manquant'
              });
            }
            
            if (!lastName) {
              lineWarnings.push({
                line: i + 1,
                field: 'Nom',
                value: '',
                message: 'Nom manquant'
              });
            }
            
            // Parse numeric values with validation
            const rawPropertyPrice = propertyPriceIdx !== -1 ? cleanValue(propertyPriceIdx) : '';
            const propertyPrice = parseNumericValue(rawPropertyPrice);
            
            if (rawPropertyPrice && propertyPrice === undefined) {
              lineWarnings.push({
                line: i + 1,
                field: 'Prix du bien',
                value: rawPropertyPrice,
                message: 'Format numérique invalide'
              });
            }
            
            const rawDownPayment = downPaymentIdx !== -1 ? cleanValue(downPaymentIdx) : '';
            const downPayment = formatDownPayment(rawDownPayment);
            
            if (rawDownPayment && downPayment === undefined) {
              lineWarnings.push({
                line: i + 1,
                field: 'Apport',
                value: rawDownPayment,
                message: 'Format numérique invalide'
              });
            }
            
            const lead: ParsedLeadWithWarnings = {
              email,
              firstName: firstName || 'Non renseigné',
              lastName: lastName || 'Non renseigné',
              phone: phoneValidation.formatted,
              propertyPrice,
              downPayment,
              purchaseType: purchaseTypeIdx !== -1 ? cleanValue(purchaseTypeIdx) || undefined : undefined,
              source: sourceIdx !== -1 ? cleanValue(sourceIdx) || undefined : undefined,
              pipelineStage: pipelineIdx !== -1 ? cleanValue(pipelineIdx) || undefined : undefined,
              lineNumber: i + 1,
              warnings: lineWarnings
            };
            
            leads.push(lead);
            allWarnings.push(...lineWarnings);
          } catch (lineErr) {
            skipped.push({ line: i + 1, reason: 'Erreur de parsing de la ligne' });
            console.error(`Error parsing line ${i + 1}:`, lineErr);
          }
        }

        if (leads.length === 0) {
          const reasons = skipped.slice(0, 5).map(s => `Ligne ${s.line}: ${s.reason}`).join('; ');
          setError('Aucun lead valide trouvé. ' + (reasons || 'Vérifiez le format du fichier.'));
          return;
        }

        console.log(`Successfully parsed ${leads.length} leads from ${lines.length - 1} data lines`);
        console.log(`Skipped ${skipped.length} lines, ${allWarnings.length} warnings`);

        setParsedLeads(leads);
        setValidationWarnings(allWarnings);
        setSkippedLines(skipped);
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
    
    if (importMode === 'pending' && user?.id) {
      // Create pending import for validation
      try {
        const leadsData = parsedLeads.map(lead => ({
          email: lead.email,
          firstName: lead.firstName,
          lastName: lead.lastName,
          phone: lead.phone,
          propertyPrice: lead.propertyPrice,
          downPayment: lead.downPayment,
          purchaseType: lead.purchaseType,
          source: lead.source,
          pipelineStage: lead.pipelineStage
        }));
        
        await importsApi.createPendingImport({
          adminId: user.id,
          fileName: fileName || 'import.csv',
          totalRows: parsedLeads.length + skippedLines.length,
          validRows: parsedLeads.length,
          invalidRows: skippedLines.length,
          data: leadsData,
          validationErrors: validationWarnings
        });
        
        setResults({ success: parsedLeads.length, failed: 0, errors: [] });
        setStep('result');
        onSuccess();
      } catch (err: any) {
        setError('Erreur lors de la création de l\'import: ' + (err.message || 'Erreur inconnue'));
      }
    } else {
      // Direct import
      const importResults = { success: 0, failed: 0, errors: [] as string[] };
      
      for (const lead of parsedLeads) {
        try {
          await adminApi.createLead(lead);
          importResults.success++;
        } catch (err: any) {
          importResults.failed++;
          importResults.errors.push(`${lead.email}: ${err.message || 'Erreur'}`);
        }
      }

      setResults(importResults);
      setStep('result');
      if (importResults.success > 0) onSuccess();
    }
    
    setImporting(false);
  };

  const resetModal = () => {
    setStep('upload');
    setParsedLeads([]);
    setValidationWarnings([]);
    setSkippedLines([]);
    setError(null);
    setFileName('');
    setImportMode('pending');
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
        maxWidth: '1100px',
        width: '95%',
        maxHeight: '90vh',
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
            
            {/* Skipped lines warning */}
            {skippedLines.length > 0 && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <AlertCircle size={16} color="#dc2626" />
                  <strong style={{ fontSize: '13px', color: '#dc2626' }}>
                    {skippedLines.length} ligne(s) ignorée(s)
                  </strong>
                </div>
                <div style={{ maxHeight: '80px', overflow: 'auto' }}>
                  {skippedLines.slice(0, 5).map((skip, idx) => (
                    <p key={idx} style={{ fontSize: '12px', color: '#b91c1c', marginBottom: '2px' }}>
                      • Ligne {skip.line}: {skip.reason}
                    </p>
                  ))}
                  {skippedLines.length > 5 && (
                    <p style={{ fontSize: '12px', color: '#b91c1c', fontStyle: 'italic' }}>
                      ... et {skippedLines.length - 5} autres
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Validation warnings */}
            {validationWarnings.length > 0 && (
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <AlertCircle size={16} color="#d97706" />
                  <strong style={{ fontSize: '13px', color: '#d97706' }}>
                    {validationWarnings.length} avertissement(s)
                  </strong>
                </div>
                <div style={{ maxHeight: '80px', overflow: 'auto' }}>
                  {validationWarnings.slice(0, 5).map((warn, idx) => (
                    <p key={idx} style={{ fontSize: '12px', color: '#b45309', marginBottom: '2px' }}>
                      • Ligne {warn.line} - {warn.field}: {warn.message} {warn.value && `("${warn.value}")`}
                    </p>
                  ))}
                  {validationWarnings.length > 5 && (
                    <p style={{ fontSize: '12px', color: '#b45309', fontStyle: 'italic' }}>
                      ... et {validationWarnings.length - 5} autres
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div style={{ maxHeight: '400px', overflow: 'auto', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '900px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0 }}>
                    <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', fontWeight: 600, whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', fontWeight: 600, minWidth: '180px' }}>Email</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', fontWeight: 600, minWidth: '120px' }}>Prénom</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', fontWeight: 600, minWidth: '120px' }}>Nom</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', fontWeight: 600, minWidth: '120px' }}>Téléphone</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', borderBottom: '2px solid #e2e8f0', fontWeight: 600, minWidth: '100px' }}>Prix bien</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', borderBottom: '2px solid #e2e8f0', fontWeight: 600, minWidth: '100px' }}>Apport</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', fontWeight: 600, minWidth: '100px' }}>Type</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', fontWeight: 600, minWidth: '80px' }}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedLeads.map((lead, idx) => (
                    <tr key={idx} style={{ backgroundColor: lead.warnings.length > 0 ? '#fffbeb' : idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {lead.lineNumber}
                        {lead.warnings.length > 0 && (
                          <span title={lead.warnings.map(w => `${w.field}: ${w.message}`).join('\n')} style={{ marginLeft: '4px', color: '#d97706' }}>⚠</span>
                        )}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', wordBreak: 'break-all' }}>{lead.email}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{lead.firstName}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{lead.lastName}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{lead.phone || '-'}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {lead.propertyPrice ? `${lead.propertyPrice.toLocaleString('fr-FR')} €` : '-'}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {lead.downPayment ? `${parseFloat(lead.downPayment).toLocaleString('fr-FR')} €` : '-'}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{lead.purchaseType || '-'}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>{lead.source || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
