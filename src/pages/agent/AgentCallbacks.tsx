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

  const [updatingCallbackId, setUpdatingCallbackId] = useState<string | null>(null);
  
  const markAsCompleted = async (id: string) => {
    // Prevent double-click
    if (updatingCallbackId === id) return;
    
    try {
      setUpdatingCallbackId(id);
      await agentApi.updateCallback(id, { 
        status: 'done', 
        completed_at: new Date().toISOString() 
      });
      loadCallbacks();
    } catch (err) {
      logger.logError('Error updating callback', err);
    } finally {
      setUpdatingCallbackId(null);
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

  const [savingNotes, setSavingNotes] = useState(false);
  
  const saveNotes = async (id: string) => {
    if (savingNotes) return;
    
    try {
      setSavingNotes(true);
      await agentApi.updateCallback(id, { notes: notesText.trim() || null });
      setEditingNotesId(null);
      setNotesText('');
      loadCallbacks();
    } catch (err) {
      logger.logError('Error saving notes', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const cancelEditNotes = () => {
    setEditingNotesId(null);
    setNotesText('');
  };

  const filteredCallbacks = callbacks.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'completed') return c.status === 'done';
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
                  ✓ Terminés ({callbacks.filter(c => c.status === 'done').length})
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
                                {callback.status === 'done' && callback.completed_at && (
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
      </div>
    </PageLayout>
  );
};

export default AgentCallbacks;
