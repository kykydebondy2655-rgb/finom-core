import React, { useState } from 'react';
import Button from '@/components/finom/Button';
import logger from '@/lib/logger';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double-submission
    if (loading) return;
    
    // Validate all fields
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Tous les champs sont requis');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Format d\'email invalide');
      return;
    }
    
    // Validate password length
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    // Validate name length
    if (formData.firstName.trim().length < 2 || formData.lastName.trim().length < 2) {
      setError('Le prénom et le nom doivent contenir au moins 2 caractères');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { adminApi } = await import('@/services/api');
      await adminApi.createAgent(
        formData.email.toLowerCase().trim(),
        formData.password,
        formData.firstName.trim(),
        formData.lastName.trim()
      );
      
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      logger.logError('Error creating agent', err);
      setError(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', firstName: '', lastName: '' });
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Créer un nouvel agent</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <label>Prénom *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Jean"
              />
            </div>
            <div className="form-group">
              <label>Nom *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Dupont"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="agent@example.com"
            />
          </div>
          
          <div className="form-group">
            <label>Mot de passe *</label>
            <input
              type="password"
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Minimum 6 caractères"
              minLength={6}
            />
          </div>

          <div className="modal-actions">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Création...' : 'Créer l\'agent'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAgentModal;
