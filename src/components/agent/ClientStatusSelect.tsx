import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/finom/Toast';
import { useAuth } from '@/context/AuthContext';
import logger from '@/lib/logger';
import { normalizeClientStatus } from '@/lib/clientStatus';

export const CLIENT_STATUSES = [
  { value: 'nouveau', label: 'Nouveau', color: '#3B82F6' },
  { value: 'nrp', label: 'NRP', color: '#EF4444' },
  { value: 'faux_numero', label: 'Faux numéro', color: '#DC2626' },
  { value: 'pas_interesse', label: 'Pas intéressé', color: '#6B7280' },
  { value: 'a_rappeler', label: 'À rappeler', color: '#8B5CF6' },
  { value: 'interesse', label: 'Intéressé', color: '#10B981' },
  { value: 'qualifie', label: 'Qualifié', color: '#059669' },
  { value: 'converti', label: 'Converti', color: '#22C55E' },
] as const;

export type ClientStatusValue = typeof CLIENT_STATUSES[number]['value'];

interface ClientStatusSelectProps {
  clientId: string;
  currentStatus: string | null;
  onStatusChange?: (newStatus: string) => void;
  onCallbackRequested?: () => void; // Callback to open callback modal
  size?: 'sm' | 'default';
}

const ClientStatusSelect: React.FC<ClientStatusSelectProps> = ({
  clientId,
  currentStatus,
  onStatusChange,
  onCallbackRequested,
  size = 'default',
}) => {
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    
    setUpdating(true);
    try {
      // Update profile status
      const { error } = await supabase
        .from('profiles')
        .update({ pipeline_stage: newStatus })
        .eq('id', clientId);

      if (error) throw error;

      // Log status change to history
      const { error: historyError } = await supabase
        .from('client_status_history')
        .insert({
          client_id: clientId,
          old_status: currentStatus,
          new_status: newStatus,
          changed_by: user?.id || null,
        });

      if (historyError) {
        logger.warn('Failed to log status history', { error: historyError.message });
      }

      toast.success('Statut mis à jour');
      onStatusChange?.(newStatus);
      
      // Auto-trigger callback modal when status is "a_rappeler"
      if (newStatus === 'a_rappeler' && onCallbackRequested) {
        onCallbackRequested();
      }
      onStatusChange?.(newStatus);
    } catch (err) {
      logger.logError('Error updating client status', err);
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(false);
    }
  };

  const normalizedCurrentStatus = normalizeClientStatus(currentStatus);
  const currentStatusInfo = CLIENT_STATUSES.find(s => s.value === normalizedCurrentStatus) || CLIENT_STATUSES[0];

  return (
    <Select
      value={normalizedCurrentStatus}
      onValueChange={handleStatusChange}
      disabled={updating}
    >
      <SelectTrigger 
        className={size === 'sm' ? 'h-8 text-xs w-[130px]' : 'w-[160px]'}
        style={{ borderColor: currentStatusInfo.color }}
      >
        <SelectValue placeholder="Statut">
          <span className="flex items-center gap-2">
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: currentStatusInfo.color }}
            />
            {currentStatusInfo.label}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {CLIENT_STATUSES.map(status => (
          <SelectItem key={status.value} value={status.value}>
            <span className="flex items-center gap-2">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: status.color }}
              />
              {status.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ClientStatusSelect;
