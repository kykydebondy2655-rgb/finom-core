import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, AlertCircle, CheckCircle, Download, Mail, Info, ChevronRight } from 'lucide-react';
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

interface ColumnMapping {
  firstName: number | null;
  lastName: number | null;
  email: number | null;
  phone: number | null;
  propertyPrice: number | null;
  downPayment: number | null;
  purchaseType: number | null;
  source: number | null;
  pipelineStage: number | null;
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

// Clean phone number (remove spaces, dashes, dots)
const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/[\s\-.()]/g, '').trim();
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

// Auto-detect column mapping based on header names
const autoDetectMapping = (headers: string[]): ColumnMapping => {
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());
  
  const findIndex = (patterns: string[]): number | null => {
    const idx = lowerHeaders.findIndex(h => 
      patterns.some(p => h.includes(p))
    );
    return idx !== -1 ? idx : null;
  };
  
  return {
    firstName: findIndex(['prenom', 'prénom', 'first_name', 'firstname', 'first name']),
    lastName: lowerHeaders.findIndex(h => 
      (h.includes('nom') && !h.includes('prenom') && !h.includes('prénom')) || 
      h.includes('last_name') || 
      h.includes('lastname') ||
      h.includes('last name')
    ) !== -1 ? lowerHeaders.findIndex(h => 
      (h.includes('nom') && !h.includes('prenom') && !h.includes('prénom')) || 
      h.includes('last_name') || 
      h.includes('lastname') ||
      h.includes('last name')
    ) : null,
    email: findIndex(['email', 'mail', 'e-mail', 'courriel']),
    phone: findIndex(['phone', 'tel', 'téléphone', 'telephone', 'mobile', 'portable']),
    propertyPrice: findIndex(['property_price', 'prix', 'prix_bien', 'prix du bien', 'montant', 'prix bien']),
    downPayment: findIndex(['down_payment', 'apport', 'apport_personnel', 'apport personnel']),
    purchaseType: findIndex(['purchase_type', 'type', 'type_achat', 'type achat']),
    source: findIndex(['source', 'origine', 'provenance']),
    pipelineStage: findIndex(['pipeline', 'stage', 'étape', 'etape', 'pipeline_stage']),
  };
};

// Generate display name for a column
const getColumnDisplayName = (header: string, index: number): string => {
  const cleaned = header.trim();
  if (cleaned && cleaned.length > 0 && !/^column\s*\d*$/i.test(cleaned)) {
    return cleaned;
  }
  return `Colonne ${index + 1}`;
};

export const ClientImportModal: React.FC<ClientImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'result'>('upload');
  const [rawData, setRawData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    propertyPrice: null,
    downPayment: null,
    purchaseType: null,
    source: null,
    pipelineStage: null,
  });
  const [autoDetected, setAutoDetected] = useState(false);
  const [parsedLeads, setParsedLeads] = useState<ParsedLeadWithWarnings[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[]>([]);
  const [skippedLines, setSkippedLines] = useState<{ line: number; reason: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mappingInfo, setMappingInfo] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [importMode, setImportMode] = useState<'direct' | 'pending'>('direct');
  const [sendWelcomeEmails, setSendWelcomeEmails] = useState(true);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[]; emailsSent: number }>({ success: 0, failed: 0, errors: [], emailsSent: 0 });

  // Column options for dropdown
  const columnOptions = useMemo(() => {
    const options: { value: number | null; label: string }[] = [
      { value: null, label: '— Ignorer —' }
    ];
    headers.forEach((header, idx) => {
      options.push({
        value: idx,
        label: getColumnDisplayName(header, idx)
      });
    });
    return options;
  }, [headers]);

  // Mapping validation
  const mappingValidation = useMemo(() => {
    const hasEmail = columnMapping.email !== null;
    const hasPhone = columnMapping.phone !== null;
    const isValid = hasEmail || hasPhone;
    
    return {
      isValid,
      message: isValid 
        ? null 
        : 'Vous devez mapper au moins le champ Email ou Téléphone pour continuer.'
    };
  }, [columnMapping]);

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

        // Parse all lines
        const allRows = lines.map(line => parseCSVLine(line));
        const headerRow = allRows[0];
        const dataRows = allRows.slice(1);

        setHeaders(headerRow);
        setRawData(dataRows);

        // Try auto-detection
        const detectedMapping = autoDetectMapping(headerRow);
        const hasAnyDetection = Object.values(detectedMapping).some(v => v !== null);
        
        setColumnMapping(detectedMapping);
        setAutoDetected(hasAnyDetection);
        
        if (!hasAnyDetection) {
          setMappingInfo('Colonnes non détectées automatiquement. Veuillez les sélectionner manuellement.');
        } else {
          const detectedFields = [];
          if (detectedMapping.firstName !== null) detectedFields.push('Prénom');
          if (detectedMapping.lastName !== null) detectedFields.push('Nom');
          if (detectedMapping.email !== null) detectedFields.push('Email');
          if (detectedMapping.phone !== null) detectedFields.push('Téléphone');
          setMappingInfo(`Détection automatique: ${detectedFields.join(', ')}. Vérifiez et ajustez si nécessaire.`);
        }

        logger.debug('CSV Headers found', { headers: headerRow, rowCount: dataRows.length });

        setError(null);
        setStep('mapping');
      } catch (err) {
        logger.logError('File parsing error', err);
        setError('Erreur lors de la lecture du fichier: ' + (err instanceof Error ? err.message : 'Erreur inconnue'));
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleMappingChange = (field: keyof ColumnMapping, value: number | null) => {
    setColumnMapping(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const processDataWithMapping = () => {
    const leads: ParsedLeadWithWarnings[] = [];
    const skipped: { line: number; reason: string }[] = [];
    const allWarnings: ValidationWarning[] = [];

    const getValue = (row: string[], colIndex: number | null): string => {
      if (colIndex === null || colIndex >= row.length) return '';
      return row[colIndex].replace(/^"|"$/g, '').trim();
    };

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const lineNumber = i + 2; // +2 because line 1 is header, and arrays are 0-indexed
      const lineWarnings: ValidationWarning[] = [];

      try {
        const rawEmail = getValue(row, columnMapping.email);
        const email = rawEmail.toLowerCase();
        const rawPhone = getValue(row, columnMapping.phone);
        const phone = cleanPhoneNumber(rawPhone);

        // Skip completely empty rows
        if (!rawEmail && !rawPhone) {
          continue;
        }

        // Validate: need at least email OR phone
        const hasValidEmail = rawEmail && isValidEmail(email);
        const phoneValidation = parseAndValidatePhone(phone);
        const hasValidPhone = phone && phoneValidation.valid;

        if (!hasValidEmail && !hasValidPhone) {
          if (rawEmail && !isValidEmail(email)) {
            skipped.push({ line: lineNumber, reason: `Email invalide: "${rawEmail}"` });
          } else if (rawPhone && !phoneValidation.valid) {
            skipped.push({ line: lineNumber, reason: `Téléphone invalide: "${rawPhone}"` });
          } else {
            skipped.push({ line: lineNumber, reason: 'Ni email ni téléphone valide' });
          }
          continue;
        }

        // Get other fields
        const firstName = getValue(row, columnMapping.firstName);
        const lastName = getValue(row, columnMapping.lastName);

        // Add warnings for missing optional fields
        if (rawPhone && !phoneValidation.valid) {
          lineWarnings.push({
            line: lineNumber,
            field: 'Téléphone',
            value: rawPhone,
            message: 'Format de téléphone non reconnu'
          });
        }

        if (!firstName) {
          lineWarnings.push({
            line: lineNumber,
            field: 'Prénom',
            value: '',
            message: 'Prénom manquant'
          });
        }

        if (!lastName) {
          lineWarnings.push({
            line: lineNumber,
            field: 'Nom',
            value: '',
            message: 'Nom manquant'
          });
        }

        // Parse numeric values
        const rawPropertyPrice = getValue(row, columnMapping.propertyPrice);
        const propertyPrice = parseNumericValue(rawPropertyPrice);

        if (rawPropertyPrice && propertyPrice === undefined) {
          lineWarnings.push({
            line: lineNumber,
            field: 'Prix du bien',
            value: rawPropertyPrice,
            message: 'Format numérique invalide'
          });
        }

        const rawDownPayment = getValue(row, columnMapping.downPayment);
        const downPayment = formatDownPayment(rawDownPayment);

        if (rawDownPayment && downPayment === undefined) {
          lineWarnings.push({
            line: lineNumber,
            field: 'Apport',
            value: rawDownPayment,
            message: 'Format numérique invalide'
          });
        }

        const lead: ParsedLeadWithWarnings = {
          email: hasValidEmail ? email : '',
          firstName: firstName || 'Non renseigné',
          lastName: lastName || 'Non renseigné',
          phone: hasValidPhone ? phoneValidation.formatted : (phone || undefined),
          propertyPrice,
          downPayment,
          purchaseType: getValue(row, columnMapping.purchaseType) || undefined,
          source: getValue(row, columnMapping.source) || undefined,
          pipelineStage: getValue(row, columnMapping.pipelineStage) || undefined,
          lineNumber,
          warnings: lineWarnings
        };

        leads.push(lead);
        allWarnings.push(...lineWarnings);
      } catch (lineErr) {
        skipped.push({ line: lineNumber, reason: 'Erreur de parsing de la ligne' });
        logger.warn('Error parsing CSV line', { line: lineNumber, error: lineErr });
      }
    }

    return { leads, skipped, allWarnings };
  };

  const handleProceedToPreview = () => {
    if (!mappingValidation.isValid) {
      setError(mappingValidation.message);
      return;
    }

    const { leads, skipped, allWarnings } = processDataWithMapping();

    if (leads.length === 0) {
      const reasons = skipped.slice(0, 5).map(s => `Ligne ${s.line}: ${s.reason}`).join('; ');
      setError('Aucun lead valide trouvé. ' + (reasons || 'Vérifiez le format du fichier et le mapping des colonnes.'));
      return;
    }

    logger.info('CSV parsing complete', { leadsCount: leads.length, totalLines: rawData.length });
    logger.debug('CSV parsing details', { skippedCount: skipped.length, warningsCount: allWarnings.length });

    setParsedLeads(leads);
    setValidationWarnings(allWarnings);
    setSkippedLines(skipped);
    setError(null);
    setStep('preview');
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
      // Use centralized temporary password constant
      const { DEFAULT_TEMP_PASSWORD } = await import('@/lib/constants');

      for (const lead of parsedLeads) {
        try {
          await adminApi.createLead(lead);
          importResults.success++;
          
          // Send welcome email with credentials if enabled
          if (sendWelcomeEmails && lead.email) {
            try {
              // Use the same fixed temp password that was used to create the account
              await emailService.sendAccountOpening(
                lead.email,
                lead.firstName,
                DEFAULT_TEMP_PASSWORD,
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
          importResults.errors.push(`${lead.email || lead.phone}: ${err.message || 'Erreur'}`);
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
    setRawData([]);
    setHeaders([]);
    setColumnMapping({
      firstName: null,
      lastName: null,
      email: null,
      phone: null,
      propertyPrice: null,
      downPayment: null,
      purchaseType: null,
      source: null,
      pipelineStage: null,
    });
    setAutoDetected(false);
    setParsedLeads([]);
    setValidationWarnings([]);
    setSkippedLines([]);
    setError(null);
    setMappingInfo(null);
    setFileName('');
    setImportMode('direct');
    setSendWelcomeEmails(true);
    setResults({ success: 0, failed: 0, errors: [], emailsSent: 0 });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Preview data for mapping step (first 5 rows)
  const previewRows = useMemo(() => {
    return rawData.slice(0, 5);
  }, [rawData]);

  // Mapped preview for confirmation step
  const mappedPreview = useMemo(() => {
    return previewRows.map((row, idx) => {
      const getValue = (colIndex: number | null): string => {
        if (colIndex === null || colIndex >= row.length) return '-';
        return row[colIndex].replace(/^"|"$/g, '').trim() || '-';
      };
      
      return {
        lineNumber: idx + 2,
        firstName: getValue(columnMapping.firstName),
        lastName: getValue(columnMapping.lastName),
        email: getValue(columnMapping.email),
        phone: getValue(columnMapping.phone),
      };
    });
  }, [previewRows, columnMapping]);

  if (!isOpen) return null;

  const mappingFields = [
    { key: 'firstName' as const, label: 'Prénom', required: false },
    { key: 'lastName' as const, label: 'Nom', required: false },
    { key: 'email' as const, label: 'Email', required: false, highlight: true },
    { key: 'phone' as const, label: 'Téléphone', required: false, highlight: true },
    { key: 'propertyPrice' as const, label: 'Prix du bien', required: false },
    { key: 'downPayment' as const, label: 'Apport', required: false },
    { key: 'purchaseType' as const, label: 'Type d\'achat', required: false },
    { key: 'source' as const, label: 'Source', required: false },
    { key: 'pipelineStage' as const, label: 'Pipeline', required: false },
  ];

  return (
    <div className="client-import-modal-overlay">
      <div className="client-import-modal">
        <div className="client-import-modal-header">
          <h2>Import de leads CSV</h2>
          <button onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="client-import-steps">
          <div className={`client-import-step ${step === 'upload' ? 'active' : 'completed'}`}>
            <span className="step-number">1</span>
            <span className="step-label">Upload</span>
          </div>
          <ChevronRight size={16} className="step-arrow" />
          <div className={`client-import-step ${step === 'mapping' ? 'active' : step === 'preview' || step === 'result' ? 'completed' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Mapping</span>
          </div>
          <ChevronRight size={16} className="step-arrow" />
          <div className={`client-import-step ${step === 'preview' ? 'active' : step === 'result' ? 'completed' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Aperçu</span>
          </div>
          <ChevronRight size={16} className="step-arrow" />
          <div className={`client-import-step ${step === 'result' ? 'active' : ''}`}>
            <span className="step-number">4</span>
            <span className="step-label">Résultat</span>
          </div>
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
              Téléchargez un fichier CSV. Les colonnes peuvent être nommées librement — vous les mapperez à l'étape suivante.
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

        {step === 'mapping' && (
          <div className="client-import-mapping">
            {mappingInfo && (
              <div className={`client-import-info ${autoDetected ? 'success' : 'neutral'}`}>
                <Info size={16} />
                <span>{mappingInfo}</span>
              </div>
            )}

            <p className="client-import-mapping-intro">
              Associez les colonnes de votre fichier aux champs requis.
              <br />
              <strong>Au minimum Email OU Téléphone doit être mappé.</strong>
            </p>

            <div className="client-import-mapping-grid">
              {mappingFields.map(field => (
                <div 
                  key={field.key} 
                  className={`client-import-mapping-row ${field.highlight ? 'highlight' : ''}`}
                >
                  <label htmlFor={`mapping-${field.key}`}>
                    {field.label}
                    {field.highlight && <span className="required-hint">*</span>}
                  </label>
                  <select
                    id={`mapping-${field.key}`}
                    value={columnMapping[field.key] ?? ''}
                    onChange={(e) => handleMappingChange(field.key, e.target.value === '' ? null : parseInt(e.target.value))}
                    className={field.highlight && columnMapping[field.key] !== null ? 'selected' : ''}
                  >
                    {columnOptions.map(opt => (
                      <option key={opt.value ?? 'null'} value={opt.value ?? ''}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {!mappingValidation.isValid && (
              <div className="client-import-validation-warning">
                <AlertCircle size={16} />
                <span>{mappingValidation.message}</span>
              </div>
            )}

            {/* Preview of raw data */}
            <div className="client-import-raw-preview">
              <h4>Aperçu des 5 premières lignes du fichier :</h4>
              <div className="client-import-table-wrapper">
                <table className="client-import-table compact">
                  <thead>
                    <tr>
                      <th>#</th>
                      {headers.map((header, idx) => (
                        <th key={idx}>{getColumnDisplayName(header, idx)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        <td className="line-num">{rowIdx + 2}</td>
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="cell-preview">
                            {cell.substring(0, 30)}{cell.length > 30 ? '...' : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mapped preview */}
            <div className="client-import-mapped-preview">
              <h4>Résultat du mapping :</h4>
              <div className="client-import-table-wrapper">
                <table className="client-import-table compact">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Prénom</th>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappedPreview.map((row, idx) => (
                      <tr key={idx}>
                        <td className="line-num">{row.lineNumber}</td>
                        <td>{row.firstName}</td>
                        <td>{row.lastName}</td>
                        <td>{row.email}</td>
                        <td>{row.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="client-import-actions">
              <button onClick={resetModal} className="client-import-btn-cancel">
                Retour
              </button>
              <button
                onClick={handleProceedToPreview}
                disabled={!mappingValidation.isValid}
                className="client-import-btn-submit"
              >
                Continuer vers l'aperçu
              </button>
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
                      <td className="email">{lead.email || '-'}</td>
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
                  <p>Chaque lead avec email recevra un email avec son mot de passe temporaire (TempPass123!)</p>
                </label>
              </div>
            )}
            
            <div className="client-import-actions">
              <button onClick={() => setStep('mapping')} className="client-import-btn-cancel">
                Retour au mapping
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
                    : `Confirmer l'import de ${parsedLeads.length} leads${sendWelcomeEmails ? ' + emails' : ''}`}
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
            {skippedLines.length > 0 && (
              <div className="client-import-result-skipped">
                <span className="value">{skippedLines.length}</span>
                <span className="label">Lignes ignorées</span>
              </div>
            )}
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
