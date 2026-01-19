import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, AlertCircle, CheckCircle, Download, Mail } from 'lucide-react';
import { adminApi, importsApi } from '../../services/api';
import { emailService } from '../../services/emailService';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail, parseAndValidatePhone } from '@/lib/validators';
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [parsedLeads, setParsedLeads] = useState<ParsedLeadWithWarnings[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[]>([]);
  const [skippedLines, setSkippedLines] = useState<{ line: number; reason: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [importMode, setImportMode] = useState<'direct' | 'pending'>('direct');
  const [sendWelcomeEmails, setSendWelcomeEmails] = useState(true);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[]; emailsSent: number }>({ success: 0, failed: 0, errors: [], emailsSent: 0 });

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

        logger.debug('CSV Headers found', { headers: headerValues });
        logger.debug('Column indices', { emailIdx, firstNameIdx, lastNameIdx, phoneIdx, propertyPriceIdx, downPaymentIdx, purchaseTypeIdx, sourceIdx, pipelineIdx });

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
            const phoneValidation = parseAndValidatePhone(rawPhone);
            
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
            logger.warn('Error parsing CSV line', { line: i + 1, error: lineErr });
          }
        }

        if (leads.length === 0) {
          const reasons = skipped.slice(0, 5).map(s => `Ligne ${s.line}: ${s.reason}`).join('; ');
          setError('Aucun lead valide trouvé. ' + (reasons || 'Vérifiez le format du fichier.'));
          return;
        }

        logger.info('CSV parsing complete', { leadsCount: leads.length, totalLines: lines.length - 1 });
        logger.debug('CSV parsing details', { skippedCount: skipped.length, warningsCount: allWarnings.length });

        setParsedLeads(leads);
        setValidationWarnings(allWarnings);
        setSkippedLines(skipped);
        setError(null);
        setStep('preview');
      } catch (err) {
        logger.logError('File parsing error', err);
        setError('Erreur lors de la lecture du fichier: ' + (err instanceof Error ? err.message : 'Erreur inconnue'));
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImport = async () => {
    setImporting(true);
    setError(null);

    if (importMode === 'pending' && user?.id) {
      // Create pending import for validation (leads will appear in Clients only after approval + processing)
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
          pipelineStage: lead.pipelineStage,
        }));

        await importsApi.createPendingImport({
          adminId: user.id,
          fileName: fileName || 'import.csv',
          totalRows: parsedLeads.length + skippedLines.length,
          validRows: parsedLeads.length,
          invalidRows: skippedLines.length,
          data: leadsData,
          validationErrors: validationWarnings,
        });

        // Close modal and redirect to the imports review screen
        handleClose();
        navigate('/admin/imports');
        return;
      } catch (err: any) {
        setError("Erreur lors de la création de l'import: " + (err.message || 'Erreur inconnue'));
      } finally {
        setImporting(false);
      }
    } else {
      // Direct import
      const importResults = { success: 0, failed: 0, errors: [] as string[], emailsSent: 0 };
      // Import secure password generator dynamically
      const { generateTempPassword } = await import('@/lib/securePassword');

      for (const lead of parsedLeads) {
        try {
          await adminApi.createLead(lead);
          importResults.success++;
          
          // Send welcome email with credentials if enabled
          if (sendWelcomeEmails && lead.email) {
            try {
              // Generate a unique temp password for each lead
              const leadTempPassword = generateTempPassword();
              await emailService.sendAccountOpening(
                lead.email,
                lead.firstName,
                leadTempPassword,
                'https://pret-finom.co/login'
              );
              importResults.emailsSent++;
            } catch (emailErr) {
              logger.warn('Email send failed', { email: lead.email, error: emailErr });
              // Don't fail the import if email fails
            }
          }
        } catch (err: any) {
          importResults.failed++;
          importResults.errors.push(`${lead.email}: ${err.message || 'Erreur'}`);
        }
      }

      setResults(importResults);
      setStep('result');
      if (importResults.success > 0) onSuccess();

      setImporting(false);
    }
  };

  const resetModal = () => {
    setStep('upload');
    setParsedLeads([]);
    setValidationWarnings([]);
    setSkippedLines([]);
    setError(null);
    setFileName('');
    setImportMode('direct');
    setSendWelcomeEmails(true);
    setResults({ success: 0, failed: 0, errors: [], emailsSent: 0 });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="client-import-modal-overlay">
      <div className="client-import-modal">
        <div className="client-import-modal-header">
          <h2>Import de leads CSV</h2>
          <button onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="client-import-error">
            <AlertCircle size={16} className="client-import-error-icon" />
            <span>{error}</span>
          </div>
        )}

        {step === 'upload' && (
          <div>
            <p className="client-import-instructions">
              Téléchargez un fichier CSV avec les colonnes: <strong>email, prénom, nom</strong><br />
              Colonnes optionnelles: téléphone, prix du bien, apport, type d'achat, source, pipeline
            </p>
            
            <div className="client-import-template-banner">
              <span>📄 Besoin d'un modèle ? Téléchargez notre fichier exemple</span>
              <a href="/templates/leads-template.csv" download="leads-template.csv" className="client-import-template-link">
                <Download size={14} />
                Télécharger le modèle
              </a>
            </div>
            
            <div className="client-import-dropzone">
              <Upload size={48} className="client-import-upload-icon" />
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="client-import-upload-label">
                Sélectionner un fichier CSV
              </label>
              <p>Formats supportés: virgule (,) ou point-virgule (;) comme séparateur</p>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div>
            <p className="client-import-preview-count">
              <strong>{parsedLeads.length}</strong> leads prêts à être importés
            </p>
            
            {/* Skipped lines warning */}
            {skippedLines.length > 0 && (
              <div className="client-import-skipped-box">
                <div className="client-import-skipped-header">
                  <AlertCircle size={16} className="text-destructive" />
                  <strong>{skippedLines.length} ligne(s) ignorée(s)</strong>
                </div>
                <div className="client-import-skipped-list">
                  {skippedLines.slice(0, 5).map((skip, idx) => (
                    <p key={idx}>• Ligne {skip.line}: {skip.reason}</p>
                  ))}
                  {skippedLines.length > 5 && (
                    <p className="more">... et {skippedLines.length - 5} autres</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Validation warnings */}
            {validationWarnings.length > 0 && (
              <div className="client-import-warnings-box">
                <div className="client-import-warnings-header">
                  <AlertCircle size={16} className="text-warning" />
                  <strong>{validationWarnings.length} avertissement(s)</strong>
                </div>
                <div className="client-import-warnings-list">
                  {validationWarnings.slice(0, 5).map((warn, idx) => (
                    <p key={idx}>• Ligne {warn.line} - {warn.field}: {warn.message} {warn.value && `("${warn.value}")`}</p>
                  ))}
                  {validationWarnings.length > 5 && (
                    <p className="more">... et {validationWarnings.length - 5} autres</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="client-import-table-wrapper">
              <table className="client-import-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th className="col-email">Email</th>
                    <th className="col-name">Prénom</th>
                    <th className="col-name">Nom</th>
                    <th className="col-name">Téléphone</th>
                    <th className="right col-amount">Prix bien</th>
                    <th className="right col-amount">Apport</th>
                    <th className="col-amount">Type</th>
                    <th className="col-source">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedLeads.map((lead, idx) => (
                    <tr key={idx} className={lead.warnings.length > 0 ? 'has-warnings' : ''}>
                      <td className="line-num">
                        {lead.lineNumber}
                        {lead.warnings.length > 0 && (
                          <span 
                            title={lead.warnings.map(w => `${w.field}: ${w.message}`).join('\n')} 
                            className="client-import-warning-icon"
                          >⚠</span>
                        )}
                      </td>
                      <td className="email">{lead.email}</td>
                      <td>{lead.firstName}</td>
                      <td>{lead.lastName}</td>
                      <td className="nowrap">{lead.phone || '-'}</td>
                      <td className="right">
                        {lead.propertyPrice ? `${lead.propertyPrice.toLocaleString('fr-FR')} €` : '-'}
                      </td>
                      <td className="right">
                        {lead.downPayment ? `${parseFloat(lead.downPayment).toLocaleString('fr-FR')} €` : '-'}
                      </td>
                      <td>{lead.purchaseType || '-'}</td>
                      <td>{lead.source || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Email option for direct import */}
            {importMode === 'direct' && (
              <div className="client-import-email-option">
                <input
                  type="checkbox"
                  id="sendWelcomeEmails"
                  checked={sendWelcomeEmails}
                  onChange={(e) => setSendWelcomeEmails(e.target.checked)}
                />
                <label htmlFor="sendWelcomeEmails">
                  <div className="client-import-email-title">
                    <Mail size={18} className="text-info" />
                    <strong>Envoyer les identifiants par email</strong>
                  </div>
                  <p>Chaque lead recevra un email avec son mot de passe temporaire (TempPass123!)</p>
                </label>
              </div>
            )}
            
            <div className="client-import-actions">
              <button onClick={resetModal} className="client-import-btn-cancel">
                Annuler
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="client-import-btn-submit"
              >
                {importing
                  ? 'Import en cours...'
                  : importMode === 'pending'
                    ? `Envoyer ${parsedLeads.length} leads pour validation`
                    : `Importer ${parsedLeads.length} leads${sendWelcomeEmails ? ' + emails' : ''}`}
              </button>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="client-import-result">
            <div className="client-import-result-icon">
              {results.success > 0 ? (
                <CheckCircle size={48} color="#22c55e" />
              ) : (
                <AlertCircle size={48} color="#dc2626" />
              )}
            </div>
            <h3>Import terminé</h3>
            <div className="client-import-result-stats">
              <div className="client-import-stat-success">
                <span className="value">{results.success}</span>
                <span className="label">Réussis</span>
              </div>
              <div className="client-import-stat-failed">
                <span className="value">{results.failed}</span>
                <span className="label">Échoués</span>
              </div>
              {results.emailsSent > 0 && (
                <div className="client-import-stat-emails">
                  <span className="value">{results.emailsSent}</span>
                  <span className="label">Emails envoyés</span>
                </div>
              )}
            </div>
            {results.errors.length > 0 && (
              <div className="client-import-errors-box">
                <p className="title">Détails des erreurs:</p>
                {results.errors.slice(0, 10).map((err, idx) => (
                  <p key={idx} className="error">• {err}</p>
                ))}
                {results.errors.length > 10 && (
                  <p className="more">... et {results.errors.length - 10} autres erreurs</p>
                )}
              </div>
            )}
            <button onClick={handleClose} className="client-import-btn-close">
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientImportModal;
