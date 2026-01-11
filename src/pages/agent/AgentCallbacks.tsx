import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import { agentApi, formatDateTime } from '@/services/api';

const AgentCallbacks: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [callbacks, setCallbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'planned' | 'completed'>('planned');

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
      console.error('Error loading callbacks:', err);
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
      console.error('Error updating callback:', err);
    }
  };

  const filteredCallbacks = callbacks.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  if (loading) {
    return <PageLayout><LoadingSpinner fullPage message="Chargement..." /></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="agent-callbacks-page">
        <div className="page-header">
          <div className="container">
            <button className="back-btn" onClick={() => navigate('/agent/dashboard')}>← Retour</button>
            <h1>Gestion des rappels</h1>
            <p>{callbacks.filter(c => c.status === 'planned').length} rappels en attente</p>
          </div>
        </div>

        <div className="container">
          {/* Filters */}
          <div className="filters fade-in">
            <button className={`filter-btn ${filter === 'planned' ? 'active' : ''}`} onClick={() => setFilter('planned')}>
              En attente ({callbacks.filter(c => c.status === 'planned').length})
            </button>
            <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
              Terminés ({callbacks.filter(c => c.status === 'completed').length})
            </button>
            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              Tous ({callbacks.length})
            </button>
          </div>

          {/* Callbacks List */}
          <Card className="callbacks-card fade-in" padding="lg">
            {filteredCallbacks.length === 0 ? (
              <p className="empty-text">Aucun rappel {filter === 'planned' ? 'en attente' : ''}</p>
            ) : (
              <div className="callbacks-list">
                {filteredCallbacks.map(callback => (
                  <div key={callback.id} className={`callback-item ${callback.status}`}>
                    <div className="callback-main">
                      <div className="callback-avatar">
                        {callback.client?.first_name?.[0] || 'C'}
                      </div>
                      <div className="callback-info">
                        <span className="callback-client">
                          {callback.client?.first_name} {callback.client?.last_name}
                        </span>
                        <span className="callback-phone">{callback.client?.phone || 'Pas de téléphone'}</span>
                        {callback.reason && <span className="callback-reason">Motif: {callback.reason}</span>}
                      </div>
                    </div>

                    <div className="callback-meta">
                      <span className="callback-time">📅 {formatDateTime(callback.scheduled_at)}</span>
                      <StatusBadge status={callback.status} size="sm" />
                    </div>

                    <div className="callback-actions">
                      {callback.status === 'planned' && (
                        <>
                          <Button variant="primary" size="sm">📞 Appeler</Button>
                          <Button variant="ghost" size="sm" onClick={() => markAsCompleted(callback.id)}>
                            ✓ Terminé
                          </Button>
                        </>
                      )}
                      {callback.status === 'completed' && callback.completed_at && (
                        <span className="completed-at">Terminé le {formatDateTime(callback.completed_at)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <style>{`
          .agent-callbacks-page { min-height: 100vh; background: var(--color-bg); padding-bottom: 4rem; }
          .page-header { background: linear-gradient(135deg, var(--color-agent) 0%, #047857 100%); color: white; padding: 2rem 1.5rem; margin-bottom: 2rem; }
          .back-btn { background: transparent; border: none; color: rgba(255,255,255,0.8); cursor: pointer; padding: 0; margin-bottom: 1rem; font-size: 0.9rem; }
          .page-header h1 { color: white; font-size: 2rem; margin-bottom: 0.25rem; }
          .container { max-width: 900px; margin: 0 auto; padding: 0 1.5rem; }
          .filters { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
          .filter-btn { padding: 0.75rem 1.25rem; border: none; background: white; border-radius: var(--radius-full); font-weight: 600; color: var(--color-text-secondary); cursor: pointer; transition: all 0.2s; }
          .filter-btn:hover { background: #f1f5f9; }
          .filter-btn.active { background: var(--color-agent); color: white; }
          .callbacks-list { display: flex; flex-direction: column; gap: 1rem; }
          .callback-item { display: grid; grid-template-columns: 1fr auto auto; gap: 1rem; align-items: center; padding: 1.25rem; background: white; border-radius: var(--radius-md); border: 1px solid var(--color-border); }
          .callback-item.completed { opacity: 0.7; background: #f8fafc; }
          .callback-main { display: flex; align-items: center; gap: 1rem; }
          .callback-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--color-agent); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; }
          .callback-client { font-weight: 600; display: block; }
          .callback-phone { font-size: 0.9rem; color: var(--color-text-secondary); }
          .callback-reason { font-size: 0.8rem; color: var(--color-text-tertiary); display: block; margin-top: 0.25rem; }
          .callback-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
          .callback-time { font-size: 0.85rem; color: var(--color-text-secondary); }
          .callback-actions { display: flex; gap: 0.5rem; }
          .completed-at { font-size: 0.8rem; color: var(--color-text-tertiary); }
          .empty-text { text-align: center; color: var(--color-text-tertiary); padding: 3rem; }
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @media (max-width: 768px) { .callback-item { grid-template-columns: 1fr; } .callback-meta { flex-direction: row; align-items: center; } }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default AgentCallbacks;
