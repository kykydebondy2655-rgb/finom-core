import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Button from '@/components/finom/Button';
import { useToast } from '@/components/finom/Toast';
import { logger } from '@/lib/logger';
import { Shield, UserCheck, User, AlertTriangle, X } from 'lucide-react';

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: {
    id: string;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    role: string | null;
  };
  currentRole: string;
}

const ROLES = [
  { value: 'client', label: 'Client', icon: User, description: 'Accès client standard' },
  { value: 'agent', label: 'Agent', icon: UserCheck, description: 'Gestion des clients assignés' },
  { value: 'admin', label: 'Administrateur', icon: Shield, description: 'Accès complet au système' },
];

const RoleManagementModal: React.FC<RoleManagementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  user,
  currentRole,
}) => {
  const toast = useToast();
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const isPromotion = ROLES.findIndex(r => r.value === selectedRole) > ROLES.findIndex(r => r.value === currentRole);
  const isDemotion = ROLES.findIndex(r => r.value === selectedRole) < ROLES.findIndex(r => r.value === currentRole);
  const hasChanged = selectedRole !== currentRole;

  const handleSubmit = async () => {
    if (!hasChanged) {
      onClose();
      return;
    }

    // Require confirmation for role changes
    if (confirmText !== 'CONFIRMER') {
      toast.error('Tapez CONFIRMER pour valider');
      return;
    }

    setLoading(true);
    try {
      // Update user_roles table (upsert to handle existing roles)
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: selectedRole as 'client' | 'agent' | 'admin',
        }, {
          onConflict: 'user_id'
        });

      if (roleError) throw roleError;

      // Also update profiles.role for consistency
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: selectedRole })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success(`Rôle de ${user.first_name || user.email} mis à jour vers ${selectedRole}`);
      onSuccess();
      onClose();
    } catch (err) {
      logger.logError('Error updating user role', err);
      toast.error('Erreur lors de la mise à jour du rôle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container role-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <Shield size={24} className="modal-icon" />
          <h2>Gérer le rôle</h2>
        </div>

        <div className="modal-body">
          <div className="user-info-banner">
            <div className="user-avatar">
              {user.first_name?.[0] || user.email?.[0] || 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{user.first_name} {user.last_name}</span>
              <span className="user-email">{user.email}</span>
              <span className="current-role">Rôle actuel: <strong>{currentRole}</strong></span>
            </div>
          </div>

          <div className="role-selector">
            <label>Nouveau rôle</label>
            <div className="role-options">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.value;
                return (
                  <button
                    key={role.value}
                    className={`role-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedRole(role.value)}
                  >
                    <Icon size={20} />
                    <span className="role-label">{role.label}</span>
                    <span className="role-description">{role.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {hasChanged && (
            <div className={`role-change-warning ${isPromotion ? 'promotion' : 'demotion'}`}>
              <AlertTriangle size={18} />
              <span>
                {isPromotion 
                  ? `Promotion de ${currentRole} vers ${selectedRole}. L'utilisateur aura plus de privilèges.`
                  : `Rétrogradation de ${currentRole} vers ${selectedRole}. L'utilisateur perdra des privilèges.`
                }
              </span>
            </div>
          )}

          {hasChanged && (
            <div className="confirm-section">
              <label>Tapez <strong>CONFIRMER</strong> pour valider</label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="CONFIRMER"
                className="confirm-input"
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button 
            variant={isDemotion ? 'danger' : 'primary'} 
            onClick={handleSubmit}
            disabled={loading || (hasChanged && confirmText !== 'CONFIRMER')}
          >
            {loading ? 'En cours...' : hasChanged ? 'Confirmer le changement' : 'Fermer'}
          </Button>
        </div>

        <style>{`
          .role-modal {
            max-width: 500px;
          }

          .user-info-banner {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: hsl(var(--muted));
            border-radius: 0.75rem;
            margin-bottom: 1.5rem;
          }

          .user-info-banner .user-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: hsl(var(--primary));
            color: hsl(var(--primary-foreground));
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1.25rem;
          }

          .user-info-banner .user-details {
            display: flex;
            flex-direction: column;
            gap: 0.125rem;
          }

          .user-info-banner .user-name {
            font-weight: 600;
            color: hsl(var(--foreground));
          }

          .user-info-banner .user-email {
            font-size: 0.875rem;
            color: hsl(var(--muted-foreground));
          }

          .user-info-banner .current-role {
            font-size: 0.75rem;
            color: hsl(var(--muted-foreground));
            margin-top: 0.25rem;
          }

          .role-selector label {
            display: block;
            font-weight: 500;
            margin-bottom: 0.75rem;
            color: hsl(var(--foreground));
          }

          .role-options {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .role-option {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem;
            border: 2px solid hsl(var(--border));
            border-radius: 0.75rem;
            background: hsl(var(--card));
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
          }

          .role-option:hover {
            border-color: hsl(var(--primary) / 0.5);
            background: hsl(var(--primary) / 0.05);
          }

          .role-option.selected {
            border-color: hsl(var(--primary));
            background: hsl(var(--primary) / 0.1);
          }

          .role-option svg {
            color: hsl(var(--primary));
            flex-shrink: 0;
          }

          .role-option .role-label {
            font-weight: 600;
            color: hsl(var(--foreground));
            min-width: 100px;
          }

          .role-option .role-description {
            font-size: 0.875rem;
            color: hsl(var(--muted-foreground));
          }

          .role-change-warning {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            margin-top: 1rem;
            font-size: 0.875rem;
          }

          .role-change-warning.promotion {
            background: hsl(142 76% 36% / 0.1);
            color: hsl(142 76% 36%);
          }

          .role-change-warning.demotion {
            background: hsl(var(--destructive) / 0.1);
            color: hsl(var(--destructive));
          }

          .confirm-section {
            margin-top: 1.5rem;
          }

          .confirm-section label {
            display: block;
            font-size: 0.875rem;
            color: hsl(var(--muted-foreground));
            margin-bottom: 0.5rem;
          }

          .confirm-input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 2px solid hsl(var(--border));
            border-radius: 0.5rem;
            font-size: 1rem;
            text-align: center;
            letter-spacing: 0.1em;
            background: hsl(var(--background));
            color: hsl(var(--foreground));
          }

          .confirm-input:focus {
            outline: none;
            border-color: hsl(var(--primary));
          }
        `}</style>
      </div>
    </div>
  );
};

export default RoleManagementModal;
