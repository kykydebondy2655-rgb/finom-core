import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import CreateCallbackModal from '@/components/agent/CreateCallbackModal';
import CallModal from '@/components/agent/CallModal';
import CallHistoryPanel from '@/components/agent/CallHistoryPanel';
import { agentApi, formatDateTime } from '@/services/api';
import type { Callback, Profile } from '@/services/api';
import logger from '@/lib/logger';

// Extended type for callbacks with client profile
interface CallbackWithClient extends Callback {
  client?: Profile | null;
}

const AgentCallbacks: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [callbacks, setCallbacks] = useState<CallbackWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'planned' | 'completed'>('planned');
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedCallback, setSelectedCallback] = useState<CallbackWithClient | null>(null);
  
  // Notes editing
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  useEffect(() => {
    if (user) loadCallbacks();
  }, [user]);

  const loadCallbacks = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await agentApi.getCallbacks(user.id);
      setCallbacks(data || []);
    } catch (err) {
      logger.logError('Error loading callbacks', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (id: string) => {
    try {
      await agentApi.updateCallback(id, { 
        status: 'completed', 
        completed_at: new Date().toISOString() 
      });
      loadCallbacks();
    } catch (err) {
      logger.logError('Error updating callback', err);
    }
  };

  const handleCall = (callback: CallbackWithClient) => {
    setSelectedCallback(callback);
    setShowCallModal(true);
  };

  const startEditNotes = (callback: CallbackWithClient) => {
    setEditingNotesId(callback.id);
    setNotesText(callback.notes || '');
  };

  const saveNotes = async (id: string) => {
    try {
      await agentApi.updateCallback(id, { notes: notesText });
      setEditingNotesId(null);
      loadCallbacks();
    } catch (err) {
      logger.logError('Error saving notes', err);
    }
  };

  const cancelEditNotes = () => {
    setEditingNotesId(null);
    setNotesText('');
  };

  const filteredCallbacks = callbacks.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  // Group callbacks by date for better organization
  const groupedCallbacks = filteredCallbacks.reduce((acc, callback) => {
    const date = new Date(callback.scheduled_at).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(callback);
    return acc;
  }, {} as Record<string, CallbackWithClient[]>);

  if (loading) {
    return <PageLayout><LoadingSpinner fullPage message="Chargement..." /></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="agent-callbacks-page">
        <div className="page-header">
          <div className="container">
            <button className="back-btn" onClick={() => navigate('/agent/dashboard')}>← Retour</button>
            <div className="header-content">
              <div>
                <h1>Gestion des rappels</h1>
                <p>{callbacks.filter(c => c.status === 'planned').length} rappels en attente</p>
              </div>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                + Nouveau rappel
              </Button>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="main-grid">
            <div className="callbacks-section">
              {/* Filters */}
              <div className="filters fade-in">
                <button 
                  className={`filter-btn ${filter === 'planned' ? 'active' : ''}`} 
                  onClick={() => setFilter('planned')}
                >
                  📅 En attente ({callbacks.filter(c => c.status === 'planned').length})
                </button>
                <button 
                  className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} 
                  onClick={() => setFilter('completed')}
                >
                  ✓ Terminés ({callbacks.filter(c => c.status === 'completed').length})
                </button>
                <button 
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`} 
                  onClick={() => setFilter('all')}
                >
                  Tous ({callbacks.length})
                </button>
              </div>

              {/* Callbacks List */}
              <Card className="callbacks-card fade-in" padding="lg">
                {filteredCallbacks.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">📞</span>
                    <p className="empty-text">Aucun rappel {filter === 'planned' ? 'en attente' : ''}</p>
                    <Button variant="secondary" size="sm" onClick={() => setShowCreateModal(true)}>
                      Planifier un rappel
                    </Button>
                  </div>
                ) : (
                  <div className="callbacks-grouped">
                    {Object.entries(groupedCallbacks).map(([date, dateCallbacks]) => (
                      <div key={date} className="date-group">
                        <h4 className="date-header">{date}</h4>
                        <div className="callbacks-list">
                          {dateCallbacks.map(callback => (
                            <div key={callback.id} className={`callback-item ${callback.status}`}>
                              <div className="callback-main">
                                <div className="callback-avatar">
                                  {callback.client?.first_name?.[0] || 'C'}
                                </div>
                                <div className="callback-info">
                                  <span className="callback-client">
                                    {callback.client?.first_name} {callback.client?.last_name}
                                  </span>
                                  <span className="callback-phone">
                                    📱 {callback.client?.phone || 'Pas de téléphone'}
                                  </span>
                                  {callback.reason && (
                                    <span className="callback-reason">💬 {callback.reason}</span>
                                  )}
                                  
                                  {/* Notes section */}
                                  {editingNotesId === callback.id ? (
                                    <div className="notes-edit">
                                      <textarea
                                        value={notesText}
                                        onChange={(e) => setNotesText(e.target.value)}
                                        placeholder="Ajouter des notes..."
                                        rows={2}
                                      />
                                      <div className="notes-actions">
                                        <Button variant="primary" size="sm" onClick={() => saveNotes(callback.id)}>
                                          Sauvegarder
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={cancelEditNotes}>
                                          Annuler
                                        </Button>
                                      </div>
                                    </div>
                                  ) : callback.notes ? (
                                    <span 
                                      className="callback-notes" 
                                      onClick={() => startEditNotes(callback)}
                                      title="Cliquer pour modifier"
                                    >
                                      📝 {callback.notes}
                                    </span>
                                  ) : null}
                                </div>
                              </div>

                              <div className="callback-meta">
                                <span className="callback-time">
                                  🕐 {new Date(callback.scheduled_at).toLocaleTimeString('fr-FR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                                <StatusBadge status={callback.status} size="sm" />
                              </div>

                              <div className="callback-actions">
                                {callback.status === 'planned' && (
                                  <>
                                    <Button 
                                      variant="primary" 
                                      size="sm" 
                                      onClick={() => handleCall(callback)}
                                    >
                                      📞 Appeler
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => startEditNotes(callback)}
                                    >
                                      📝 Notes
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => markAsCompleted(callback.id)}
                                    >
                                      ✓
                                    </Button>
                                  </>
                                )}
                                {callback.status === 'completed' && callback.completed_at && (
                                  <span className="completed-at">
                                    Terminé le {formatDateTime(callback.completed_at)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Call History Sidebar */}
            <div className="history-section fade-in">
              <CallHistoryPanel />
            </div>
          </div>
        </div>

        {/* Modals */}
        <CreateCallbackModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadCallbacks}
        />

        <CallModal
          isOpen={showCallModal}
          onClose={() => {
            setShowCallModal(false);
            setSelectedCallback(null);
          }}
          onSuccess={loadCallbacks}
          callback={selectedCallback}
        />

        <style>{`
          .agent-callbacks-page { min-height: 100vh; background: var(--color-bg); padding-bottom: 4rem; }
          .page-header { background: linear-gradient(135deg, var(--color-agent) 0%, #047857 100%); color: white; padding: 2rem 1.5rem; margin-bottom: 2rem; }
          .back-btn { background: transparent; border: none; color: rgba(255,255,255,0.8); cursor: pointer; padding: 0; margin-bottom: 1rem; font-size: 0.9rem; }
          .header-content { display: flex; justify-content: space-between; align-items: center; }
          .page-header h1 { color: white; font-size: 2rem; margin-bottom: 0.25rem; }
          .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
          
          .main-grid { display: grid; grid-template-columns: 1fr 350px; gap: 2rem; }
          .callbacks-section { min-width: 0; }
          
          .filters { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
          .filter-btn { padding: 0.75rem 1.25rem; border: none; background: white; border-radius: var(--radius-full); font-weight: 600; color: var(--color-text-secondary); cursor: pointer; transition: all 0.2s; }
          .filter-btn:hover { background: #f1f5f9; }
          .filter-btn.active { background: var(--color-agent); color: white; }
          
          .callbacks-grouped { display: flex; flex-direction: column; gap: 1.5rem; }
          .date-header { font-size: 0.85rem; text-transform: capitalize; color: var(--color-text-secondary); margin: 0 0 0.75rem 0; padding-bottom: 0.5rem; border-bottom: 1px solid var(--color-border); }
          
          .callbacks-list { display: flex; flex-direction: column; gap: 0.75rem; }
          .callback-item { display: grid; grid-template-columns: 1fr auto auto; gap: 1rem; align-items: flex-start; padding: 1.25rem; background: white; border-radius: var(--radius-md); border: 1px solid var(--color-border); transition: box-shadow 0.2s; }
          .callback-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
          .callback-item.completed { opacity: 0.7; background: #f8fafc; }
          
          .callback-main { display: flex; align-items: flex-start; gap: 1rem; }
          .callback-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--color-agent); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0; }
          .callback-info { display: flex; flex-direction: column; gap: 0.25rem; }
          .callback-client { font-weight: 600; }
          .callback-phone { font-size: 0.9rem; color: var(--color-text-secondary); }
          .callback-reason { font-size: 0.85rem; color: var(--color-text-tertiary); }
          .callback-notes { font-size: 0.85rem; color: var(--color-agent); cursor: pointer; padding: 0.25rem 0.5rem; background: #ecfdf5; border-radius: var(--radius-sm); display: inline-block; margin-top: 0.25rem; }
          .callback-notes:hover { background: #d1fae5; }
          
          .notes-edit { margin-top: 0.5rem; }
          .notes-edit textarea { width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.9rem; resize: vertical; }
          .notes-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
          
          .callback-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
          .callback-time { font-size: 0.9rem; color: var(--color-text-secondary); font-weight: 500; }
          
          .callback-actions { display: flex; gap: 0.5rem; align-items: center; }
          .completed-at { font-size: 0.8rem; color: var(--color-text-tertiary); }
          
          .empty-state { text-align: center; padding: 3rem; }
          .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
          .empty-text { color: var(--color-text-tertiary); margin-bottom: 1rem; }
          
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          
          @media (max-width: 1024px) { 
            .main-grid { grid-template-columns: 1fr; }
            .history-section { order: -1; }
          }
          @media (max-width: 768px) { 
            .callback-item { grid-template-columns: 1fr; }
            .callback-meta { flex-direction: row; align-items: center; }
            .callback-actions { flex-wrap: wrap; }
            .header-content { flex-direction: column; gap: 1rem; align-items: flex-start; }
          }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default AgentCallbacks;
