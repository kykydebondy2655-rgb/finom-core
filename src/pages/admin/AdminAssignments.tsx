import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AssignmentModal from '@/components/admin/AssignmentModal';
import { adminApi, formatDate } from '@/services/api';
import logger from '@/lib/logger';

const AdminAssignments: React.FC = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getClientAssignments();
      setAssignments(data || []);
    } catch (err) {
      logger.logError('Error loading assignments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette assignation ?')) return;
    
    try {
      setDeleting(id);
      await adminApi.deleteAssignment(id);
      loadAssignments();
    } catch (err) {
      logger.logError('Error deleting assignment', err);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <PageLayout><LoadingSpinner fullPage message="Chargement..." /></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="admin-assignments-page">
        <div className="page-header">
          <div className="container">
            <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>← Retour</button>
            <h1>Assignations client-agent</h1>
            <p>{assignments.length} assignations</p>
          </div>
        </div>

        <div className="container">
          <Card className="assignments-card fade-in" padding="lg">
            <div className="card-header">
              <h3>Liste des assignations</h3>
              <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
                + Nouvelle assignation
              </Button>
            </div>

            {assignments.length === 0 ? (
              <p className="empty-text">Aucune assignation</p>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Agent</th>
                      <th>Assigné le</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(a => (
                      <tr key={a.id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar client">{a.client?.first_name?.[0] || 'C'}</div>
                            <div>
                              <span className="user-name">{a.client?.first_name} {a.client?.last_name}</span>
                              <span className="user-email">{a.client?.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar agent">{a.agent?.first_name?.[0] || 'A'}</div>
                            <div>
                              <span className="user-name">{a.agent?.first_name} {a.agent?.last_name}</span>
                              <span className="user-email">{a.agent?.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="date">{formatDate(a.assigned_at)}</td>
                        <td>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(a.id)}
                            disabled={deleting === a.id}
                          >
                            {deleting === a.id ? '...' : '🗑️'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <AssignmentModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSuccess={loadAssignments}
            existingAssignments={assignments.map(a => ({
              client_user_id: a.client_user_id,
              agent_user_id: a.agent_user_id
            }))}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminAssignments;
