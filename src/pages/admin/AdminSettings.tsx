import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/components/finom/Toast';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { 
  Settings, 
  DollarSign, 
  Percent, 
  Clock, 
  Shield, 
  Mail,
  Save,
  RefreshCw
} from 'lucide-react';

interface SystemSetting {
  key: string;
  value: string;
  category: string;
  type: string;
  description: string | null;
  updated_at: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  loans: <DollarSign size={20} />,
  rates: <Percent size={20} />,
  business: <Clock size={20} />,
  security: <Shield size={20} />,
  email: <Mail size={20} />
};

const categoryLabels: Record<string, string> = {
  loans: 'Paramètres de prêt',
  rates: 'Taux d\'intérêt',
  business: 'Horaires d\'ouverture',
  security: 'Sécurité',
  email: 'Configuration email'
};

const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState<string>('loans');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category')
        .order('key');

      if (error) throw error;
      setSettings(data || []);
      
      // Initialize edited values
      const initial: Record<string, string> = {};
      data?.forEach(s => { initial[s.key] = s.value; });
      setEditedValues(initial);
    } catch (err) {
      logger.logError('Error loading settings', err);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      const updates = settings.filter(s => editedValues[s.key] !== s.value);
      
      for (const setting of updates) {
        const { error } = await supabase
          .from('system_settings')
          .update({ 
            value: editedValues[setting.key],
            updated_by: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('key', setting.key);

        if (error) throw error;
      }

      toast.success(`${updates.length} paramètre(s) mis à jour`);
      await loadSettings();
    } catch (err) {
      logger.logError('Error saving settings', err);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = settings.some(s => editedValues[s.key] !== s.value);
  const categories = [...new Set(settings.map(s => s.category))];
  const filteredSettings = settings.filter(s => s.category === activeCategory);

  if (loading) {
    return <PageLayout><LoadingSpinner fullPage message="Chargement des paramètres..." /></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="admin-settings-page">
        <div className="page-header">
          <div className="container">
            <div className="header-content">
              <div className="header-title">
                <Settings size={28} className="header-icon" />
                <div>
                  <h1>Paramètres système</h1>
                  <p>Configuration globale de la plateforme FINOM</p>
                </div>
              </div>
              <div className="header-actions">
                <Button 
                  variant="ghost" 
                  onClick={loadSettings}
                  disabled={loading}
                >
                  <RefreshCw size={18} />
                  Actualiser
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  isLoading={saving}
                >
                  <Save size={18} />
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="settings-layout">
            {/* Category Sidebar */}
            <aside className="settings-sidebar">
              <nav className="category-nav">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {categoryIcons[cat] || <Settings size={20} />}
                    <span>{categoryLabels[cat] || cat}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Settings Content */}
            <main className="settings-content">
              <Card padding="xl">
                <div className="settings-category-header">
                  {categoryIcons[activeCategory]}
                  <h2>{categoryLabels[activeCategory] || activeCategory}</h2>
                </div>

                <div className="settings-list">
                  {filteredSettings.map(setting => (
                    <div key={setting.key} className="setting-item">
                      <div className="setting-info">
                        <label htmlFor={setting.key}>{setting.description || setting.key}</label>
                        <span className="setting-key">{setting.key}</span>
                      </div>
                      <div className="setting-input">
                        {setting.type === 'number' ? (
                          <input
                            id={setting.key}
                            type="number"
                            value={editedValues[setting.key] || ''}
                            onChange={(e) => handleValueChange(setting.key, e.target.value)}
                            className="form-input"
                            step={setting.key.includes('rate') ? '0.01' : '1'}
                          />
                        ) : (
                          <input
                            id={setting.key}
                            type="text"
                            value={editedValues[setting.key] || ''}
                            onChange={(e) => handleValueChange(setting.key, e.target.value)}
                            className="form-input"
                          />
                        )}
                        {editedValues[setting.key] !== setting.value && (
                          <span className="modified-badge">Modifié</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {hasChanges && (
                  <div className="settings-footer">
                    <p className="changes-notice">
                      ⚠️ Vous avez des modifications non enregistrées
                    </p>
                    <Button variant="primary" onClick={handleSave} isLoading={saving}>
                      <Save size={18} />
                      Enregistrer les modifications
                    </Button>
                  </div>
                )}
              </Card>
            </main>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminSettings;
