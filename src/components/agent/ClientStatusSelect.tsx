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
import logger from '@/lib/logger';

export const CLIENT_STATUSES = [
  { value: 'new', label: 'Nouveau', color: '#3B82F6' },
  { value: 'nrp', label: 'NRP', color: '#EF4444' },
  { value: 'not_interested', label: 'Pas intéressé', color: '#6B7280' },
  { value: 'pending', label: 'En attente', color: '#F59E0B' },
  { value: 'callback', label: 'À rappeler', color: '#8B5CF6' },
  { value: 'interested', label: 'Intéressé', color: '#10B981' },
  { value: 'qualified', label: 'Qualifié', color: '#059669' },
  { value: 'converted', label: 'Converti', color: '#22C55E' },
] as const;

export type ClientStatusValue = typeof CLIENT_STATUSES[number]['value'];

interface ClientStatusSelectProps {
  clientId: string;
  currentStatus: string | null;
  onStatusChange?: (newStatus: string) => void;
  size?: 'sm' | 'default';
}

const ClientStatusSelect: React.FC<ClientStatusSelectProps> = ({
  clientId,
  currentStatus,
  onStatusChange,
  size = 'default',
}) => {
  const [updating, setUpdating] = useState(false);
  const toast = useToast();

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ pipeline_stage: newStatus })
        .eq('id', clientId);

      if (error) throw error;

      toast.success('Statut mis à jour');
      onStatusChange?.(newStatus);
    } catch (err) {
      logger.logError('Error updating client status', err);
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(false);
    }
  };

  const currentStatusInfo = CLIENT_STATUSES.find(s => s.value === currentStatus) || CLIENT_STATUSES[0];

  return (
    <Select
      value={currentStatus || 'new'}
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
