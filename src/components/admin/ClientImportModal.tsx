import React, { useState, useRef, useEffect } from 'react';
import Button from '@/components/finom/Button';
import { adminApi, Profile } from '@/services/api';

interface ClientImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedClient {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  assignedAgentId?: string;
}

const ClientImportModal: React.FC<ClientImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [agents, setAgents] = useState<Profile[]>([]);
  const [parsedClients, setParsedClients] = useState<ParsedClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] }>({ success: 0, failed: 0, errors: [] });

  useEffect(() => {
    if (isOpen) {
      loadAgents();
    }
  }, [isOpen]);

  const loadAgents = async () => {
    try {
      const data = await adminApi.getAllAgents();
      setAgents(data || []);
    } catch (err) {
      console.error('Error loading agents:', err);
    }
  };

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

        // Parse header
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const emailIdx = headers.findIndex(h => h.includes('email'));
        const firstNameIdx = headers.findIndex(h => h.includes('prenom') || h.includes('first'));
        const lastNameIdx = headers.findIndex(h => h.includes('nom') || h.includes('last'));
        const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('tel'));

        if (emailIdx === -1 || firstNameIdx === -1 || lastNameIdx === -1) {
          setError('Le CSV doit contenir les colonnes: email, prénom (ou first_name), nom (ou last_name)');
          return;
        }

        // Parse data
        const clients: ParsedClient[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          if (values[emailIdx]) {
            clients.push({
              email: values[emailIdx],
              firstName: values[firstNameIdx] || '',
              lastName: values[lastNameIdx] || '',
              phone: phoneIdx !== -1 ? values[phoneIdx] : undefined
            });
          }
        }

        if (clients.length === 0) {
          setError('Aucun client valide trouvé dans le fichier');
          return;
        }

        setParsedClients(clients);
        setError(null);
        setStep('preview');
      } catch (err) {
        setError('Erreur lors de la lecture du fichier');
      }
    };
    reader.readAsText(file);
  };

  const handleAgentAssignment = (index: number, agentId: string) => {
    setParsedClients(prev => prev.map((c, i) => 
      i === index ? { ...c, assignedAgentId: agentId || undefined } : c
    ));
  };

  const handleBulkAssignment = (agentId: string) => {
    setParsedClients(prev => prev.map(c => ({ ...c, assignedAgentId: agentId || undefined })));
  };

  const handleImport = async () => {
    setImporting(true);
    setError(null);
    
    const importResults = { success: 0, failed: 0, errors: [] as string[] };
    const createdClients: { userId: string; agentId: string }[] = [];
    
    for (const client of parsedClients) {
      try {
        // Generate a temporary password
        const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
        const result = await adminApi.createClient(
          client.email,
          tempPassword,
          client.firstName,
          client.lastName,
          client.phone
        );
        
        if (result.user && client.assignedAgentId) {
          createdClients.push({ userId: result.user.id, agentId: client.assignedAgentId });
        }
        importResults.success++;
      } catch (err: any) {
        importResults.failed++;
        importResults.errors.push(`${client.email}: ${err.message}`);
      }
    }

    // Batch create assignments
    if (createdClients.length > 0) {
      try {
        await adminApi.createBatchAssignments(
          createdClients.map(c => ({ agentUserId: c.agentId, clientUserId: c.userId }))
        );
      } catch (err: any) {
        importResults.errors.push(`Assignations: ${err.message}`);
      }
    }

    setResults(importResults);
    setStep('result');
    setImporting(false);
    
    if (importResults.success > 0) {
      onSuccess();
    }
  };

  const resetModal = () => {
    setParsedClients([]);
    setError(null);
    setStep('upload');
    setResults({ success: 0, failed: 0, errors: [] });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {step === 'upload' && 'Importer des clients (CSV)'}
            {step === 'preview' && `Aperçu - ${parsedClients.length} clients`}
            {step === 'result' && 'Résultat de l\'import'}
          </h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          
          {step === 'upload' && (
            <div className="upload-section">
              <div className="upload-info">
                <h3>Format CSV attendu</h3>
                <p>Le fichier doit contenir les colonnes suivantes :</p>
                <ul>
                  <li><strong>email</strong> (requis)</li>
                  <li><strong>prenom</strong> ou <strong>first_name</strong> (requis)</li>
                  <li><strong>nom</strong> ou <strong>last_name</strong> (requis)</li>
                  <li><strong>telephone</strong> ou <strong>phone</strong> (optionnel)</li>
                </ul>
                <div className="example-csv">
                  <code>email,prenom,nom,telephone<br/>jean@example.com,Jean,Dupont,0612345678</code>
                </div>
              </div>
              
              <div className="file-input-wrapper">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="file-label">
                  📁 Sélectionner un fichier CSV
                </label>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="preview-section">
              <div className="bulk-assign">
                <label>Assigner tous les clients à :</label>
                <select onChange={e => handleBulkAssignment(e.target.value)}>
                  <option value="">-- Aucun agent --</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.first_name} {agent.last_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="clients-table-wrapper">
                <table className="clients-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Prénom</th>
                      <th>Nom</th>
                      <th>Téléphone</th>
                      <th>Agent assigné</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedClients.map((client, index) => (
                      <tr key={index}>
                        <td>{client.email}</td>
                        <td>{client.firstName}</td>
                        <td>{client.lastName}</td>
                        <td>{client.phone || '-'}</td>
                        <td>
                          <select
                            value={client.assignedAgentId || ''}
                            onChange={e => handleAgentAssignment(index, e.target.value)}
                          >
                            <option value="">-- Aucun --</option>
                            {agents.map(agent => (
                              <option key={agent.id} value={agent.id}>
                                {agent.first_name} {agent.last_name}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-actions">
                <Button variant="ghost" onClick={() => setStep('upload')}>Retour</Button>
                <Button variant="primary" onClick={handleImport} disabled={importing}>
                  {importing ? 'Import en cours...' : `Importer ${parsedClients.length} clients`}
                </Button>
              </div>
            </div>
          )}

          {step === 'result' && (
            <div className="result-section">
              <div className="result-summary">
                <div className="result-stat success">
                  <span className="stat-number">{results.success}</span>
                  <span className="stat-label">Créés avec succès</span>
                </div>
                <div className="result-stat failed">
                  <span className="stat-number">{results.failed}</span>
                  <span className="stat-label">Échecs</span>
                </div>
              </div>
              
              {results.errors.length > 0 && (
                <div className="errors-list">
                  <h4>Détails des erreurs :</h4>
                  <ul>
                    {results.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="modal-actions">
                <Button variant="primary" onClick={handleClose}>Fermer</Button>
              </div>
            </div>
          )}
        </div>

        <style>{`
          .modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
          .modal-content {
            background: var(--color-bg);
            border-radius: 16px;
            width: 90%;
            max-width: 480px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          }
          .modal-content.large {
            max-width: 800px;
          }
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid var(--color-border);
          }
          .modal-header h2 { margin: 0; font-size: 1.25rem; }
          .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--color-text-secondary);
          }
          .modal-body { padding: 1.5rem; }
          .error-message {
            background: #fef2f2;
            color: #dc2626;
            padding: 0.75rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            font-size: 0.875rem;
          }
          .upload-info {
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: var(--color-muted);
            border-radius: 8px;
          }
          .upload-info h3 { margin: 0 0 0.5rem; font-size: 1rem; }
          .upload-info p { margin: 0 0 0.5rem; color: var(--color-text-secondary); }
          .upload-info ul { margin: 0.5rem 0; padding-left: 1.5rem; }
          .upload-info li { margin: 0.25rem 0; }
          .example-csv {
            margin-top: 1rem;
            padding: 0.75rem;
            background: var(--color-bg);
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.8rem;
            overflow-x: auto;
          }
          .file-input-wrapper {
            text-align: center;
          }
          .file-input-wrapper input[type="file"] {
            display: none;
          }
          .file-label {
            display: inline-block;
            padding: 1rem 2rem;
            background: var(--color-admin);
            color: white;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: opacity 0.2s;
          }
          .file-label:hover { opacity: 0.9; }
          .bulk-assign {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
            padding: 1rem;
            background: var(--color-muted);
            border-radius: 8px;
          }
          .bulk-assign select {
            flex: 1;
            padding: 0.5rem;
            border: 1px solid var(--color-border);
            border-radius: 4px;
            background: var(--color-bg);
          }
          .clients-table-wrapper {
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid var(--color-border);
            border-radius: 8px;
          }
          .clients-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.875rem;
          }
          .clients-table th, .clients-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--color-border);
          }
          .clients-table th {
            background: var(--color-muted);
            font-weight: 600;
            position: sticky;
            top: 0;
          }
          .clients-table select {
            width: 100%;
            padding: 0.25rem;
            border: 1px solid var(--color-border);
            border-radius: 4px;
            background: var(--color-bg);
            font-size: 0.75rem;
          }
          .modal-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 1.5rem;
          }
          .result-summary {
            display: flex;
            gap: 2rem;
            justify-content: center;
            margin-bottom: 1.5rem;
          }
          .result-stat {
            text-align: center;
            padding: 1.5rem 2rem;
            border-radius: 12px;
          }
          .result-stat.success {
            background: #dcfce7;
            color: #16a34a;
          }
          .result-stat.failed {
            background: #fef2f2;
            color: #dc2626;
          }
          .stat-number {
            display: block;
            font-size: 2rem;
            font-weight: 700;
          }
          .stat-label {
            font-size: 0.875rem;
          }
          .errors-list {
            background: #fef2f2;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
          }
          .errors-list h4 { margin: 0 0 0.5rem; font-size: 0.875rem; }
          .errors-list ul { margin: 0; padding-left: 1.5rem; font-size: 0.8rem; }
        `}</style>
      </div>
    </div>
  );
};

export default ClientImportModal;
