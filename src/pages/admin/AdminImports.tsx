import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { importsApi, PendingImport, formatDate } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/finom/Toast';
import { CheckCircle, XCircle, Clock, FileText, Eye, Trash2, Play } from 'lucide-react';
import logger from '@/lib/logger';

const AdminImports: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [imports, setImports] = useState<PendingImport[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedImport, setSelectedImport] = useState<PendingImport | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    loadImports();
  }, []);

  const loadImports = async () => {
    try {
      setLoading(true);
      const data = await importsApi.getPendingImports();
      setImports(data);
    } catch (err) {
      logger.logError('Error loading imports', err);
      toast.error('Erreur lors du chargement des imports');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (importItem: PendingImport) => {
    if (!user?.id) return;
    try {
      setProcessing(importItem.id);
      await importsApi.approveImport(importItem.id, user.id);
      toast.success('Import approuvé');
      loadImports();
    } catch (err) {
      logger.logError('Error approving import', err);
      toast.error('Erreur lors de l\'approbation');
    } finally {
      setProcessing(null);
    }
  };

  const handleProcess = async (importItem: PendingImport) => {
    try {
      setProcessing(importItem.id);
      const result = await importsApi.processImport(importItem.id) as { success_count: number; error_count: number };
      toast.success(`Import traité: ${result.success_count} leads créés, ${result.error_count} erreurs`);
      loadImports();
    } catch (err) {
      logger.logError('Error processing import', err);
      toast.error('Erreur lors du traitement');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedImport || !user?.id || !rejectReason.trim()) return;
    try {
      setProcessing(selectedImport.id);
      await importsApi.rejectImport(selectedImport.id, user.id, rejectReason);
      toast.success('Import rejeté');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedImport(null);
      loadImports();
    } catch (err) {
      logger.logError('Error rejecting import', err);
      toast.error('Erreur lors du rejet');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet import ?')) return;
    try {
      await importsApi.deletePendingImport(id);
      toast.success('Import supprimé');
      loadImports();
    } catch (err) {
      logger.logError('Error deleting import', err);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (status: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      pending: <Clock size={14} />,
      approved: <CheckCircle size={14} />,
      rejected: <XCircle size={14} />,
      processed: <CheckCircle size={14} />
    };
    const labelMap: Record<string, string> = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      processed: 'Traité'
    };
    return (
      <span className={`status-badge ${status}`}>
        {iconMap[status] || iconMap.pending} {labelMap[status] || labelMap.pending}
      </span>
    );
  };

  if (loading) {
    return <PageLayout><LoadingSpinner fullPage message="Chargement..." /></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="admin-imports-page">
        <div className="page-header">
          <div className="container">
            <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>← Retour</button>
            <div className="header-row">
              <div>
                <h1>Imports en attente</h1>
                <p>{imports.filter(i => i.status === 'pending').length} en attente de validation</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <Card className="fade-in" padding="lg">
            {imports.length === 0 ? (
              <div className="empty-state">
                <FileText size={48} color="#94a3b8" />
                <p>Aucun import en attente</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fichier</th>
                      <th>Lignes</th>
                      <th>Valides</th>
                      <th>Erreurs</th>
                      <th>Statut</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {imports.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div className="file-cell">
                            <FileText size={16} />
                            <span>{item.file_name}</span>
                          </div>
                        </td>
                        <td>{item.total_rows}</td>
                        <td className="valid-count">{item.valid_rows}</td>
                        <td className={`invalid-count ${item.invalid_rows > 0 ? 'has-errors' : ''}`}>{item.invalid_rows}</td>
                        <td>{getStatusBadge(item.status)}</td>
                        <td className="date">{formatDate(item.created_at)}</td>
                        <td>
                          <div className="action-btns">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedImport(item);
                                setShowDetailModal(true);
                              }}
                            >
                              <Eye size={14} />
                            </Button>
                            
                            {item.status === 'pending' && (
                              <>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleApprove(item)}
                                  disabled={processing === item.id}
                                >
                                  <CheckCircle size={14} />
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedImport(item);
                                    setShowRejectModal(true);
                                  }}
                                  disabled={processing === item.id}
                                >
                                  <XCircle size={14} />
                                </Button>
                              </>
                            )}
                            
                            {item.status === 'approved' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleProcess(item)}
                                disabled={processing === item.id}
                              >
                                <Play size={14} /> Traiter
                              </Button>
                            )}
                            
                            {(item.status === 'rejected' || item.status === 'processed') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedImport && (
          <div className="modal-overlay">
            <div className="modal-content large">
              <div className="modal-header">
                <h3>Détail de l'import: {selectedImport.file_name}</h3>
                <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="stats-row">
                  <div className="stat-box">
                    <span className="stat-value">{selectedImport.total_rows}</span>
                    <span className="stat-label">Total</span>
                  </div>
                  <div className="stat-box success">
                    <span className="stat-value">{selectedImport.valid_rows}</span>
                    <span className="stat-label">Valides</span>
                  </div>
                  <div className="stat-box error">
                    <span className="stat-value">{selectedImport.invalid_rows}</span>
                    <span className="stat-label">Erreurs</span>
                  </div>
                </div>
                
                <h4>Données à importer ({selectedImport.data.length} leads)</h4>
                <div className="preview-table-wrapper">
                  <table className="preview-table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Prénom</th>
                        <th>Nom</th>
                        <th>Téléphone</th>
                        <th>Prix bien</th>
                        <th>Apport</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedImport.data.slice(0, 50).map((lead: any, idx: number) => (
                        <tr key={idx}>
                          <td>{lead.email}</td>
                          <td>{lead.firstName}</td>
                          <td>{lead.lastName}</td>
                          <td>{lead.phone || '-'}</td>
                          <td>{lead.propertyPrice ? `${Number(lead.propertyPrice).toLocaleString('fr-FR')} €` : '-'}</td>
                          <td>{lead.downPayment ? `${Number(lead.downPayment).toLocaleString('fr-FR')} €` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {selectedImport.data.length > 50 && (
                    <p className="more-rows">... et {selectedImport.data.length - 50} autres</p>
                  )}
                </div>

                {selectedImport.validation_errors.length > 0 && (
                  <>
                    <h4 className="errors-title">Erreurs de validation ({selectedImport.validation_errors.length})</h4>
                    <div className="errors-list">
                      {selectedImport.validation_errors.slice(0, 10).map((err: any, idx: number) => (
                        <div key={idx} className="error-item">
                          Ligne {err.line}: {err.field} - {err.message} ({err.value})
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {selectedImport.rejection_reason && (
                  <div className="rejection-reason">
                    <strong>Raison du rejet:</strong> {selectedImport.rejection_reason}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Fermer</Button>
                {selectedImport.status === 'pending' && (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => {
                        handleApprove(selectedImport);
                        setShowDetailModal(false);
                      }}
                    >
                      Approuver
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setShowDetailModal(false);
                        setShowRejectModal(true);
                      }}
                    >
                      Rejeter
                    </Button>
                  </>
                )}
                {selectedImport.status === 'approved' && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleProcess(selectedImport);
                      setShowDetailModal(false);
                    }}
                  >
                    Traiter l'import
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedImport && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Rejeter l'import</h3>
                <button className="close-btn" onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}>×</button>
              </div>
              <div className="modal-body">
                <label>
                  Raison du rejet:
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Indiquez la raison du rejet..."
                    rows={4}
                    className="reject-textarea"
                  />
                </label>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}>Annuler</Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || processing === selectedImport.id}
                >
                  Confirmer le rejet
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AdminImports;
