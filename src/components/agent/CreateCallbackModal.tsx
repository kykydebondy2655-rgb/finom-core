import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/finom/Button';
import { agentApi } from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/components/finom/Toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import logger from '@/lib/logger';

interface CreateCallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedClientId?: string;
  preselectedClientName?: string;
}

interface ClientOption {
  id: string;
  name: string;
}

const CreateCallbackModal: React.FC<CreateCallbackModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedClientId,
  preselectedClientName
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClient, setSelectedClient] = useState(preselectedClientId || '');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      loadClients();
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow);
      setScheduledTime('10:00');
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (preselectedClientId) {
      setSelectedClient(preselectedClientId);
    }
  }, [preselectedClientId]);

  const loadClients = async () => {
    if (!user) return;
    try {
      setLoadingClients(true);
      const data = await agentApi.getAssignedClients(user.id);
      setClients(
        (data || []).map((a: any) => ({
          id: a.client_user_id,
          name: `${a.client?.first_name || ''} ${a.client?.last_name || ''}`.trim() || 'Client'
        }))
      );
    } catch (err) {
      logger.logError('Error loading clients', err);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double-submission
    if (loading) return;
    
    if (!user || !selectedClient || !selectedDate || !scheduledTime) {
      toast.warning("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    // Validate that selected date is not in the past
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const scheduledAt = new Date(`${dateStr}T${scheduledTime}`);
    if (scheduledAt < new Date()) {
      toast.warning("La date et l'heure doivent être dans le futur");
      return;
    }

    try {
      setLoading(true);
      toast.info('Création du rappel...');
      logger.debug('Creating callback', {
        agent_id: user.id,
        client_id: selectedClient,
        scheduled_at: scheduledAt.toISOString(),
      });

      await agentApi.createCallback({
        agent_id: user.id,
        client_id: selectedClient,
        scheduled_at: scheduledAt.toISOString(),
        reason: reason.trim() || null,
        notes: notes.trim() || null,
        status: 'planned'
      });

      onSuccess();
      toast.success('Rappel planifié');
      onClose();
      resetForm();
    } catch (err: any) {
      logger.logError('Error creating callback', err);
      toast.error(err?.message || "Impossible de planifier le rappel");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedClient(preselectedClientId || '');
    setReason('');
    setNotes('');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow);
    setScheduledTime('10:00');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl"  style={{ backgroundColor: 'white' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            📞 Planifier un rappel
          </DialogTitle>
          <DialogDescription className="sr-only">
            Planifiez un rappel avec une date, une heure, un motif et des notes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Client Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Client *</label>
            {loadingClients ? (
              <p className="text-sm text-muted-foreground italic">Chargement...</p>
            ) : preselectedClientId ? (
              <div className="p-3 bg-muted rounded-md font-medium">
                {preselectedClientName || 'Client sélectionné'}
              </div>
            ) : (
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                required
                className="w-full p-3 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date Selection with Calendar */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Date du rappel *</label>
            <div className="border border-input rounded-md p-3 bg-background">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={fr}
                disabled={(date) => date < new Date()}
                className="mx-auto"
              />
              {selectedDate && (
                <div className="mt-2 text-center text-sm font-medium text-primary">
                  📅 {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                </div>
              )}
            </div>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Heure *</label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              required
              className="w-full p-3 border border-input rounded-md bg-background text-foreground"
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Motif du rappel</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Suivi dossier de prêt, Relance documents..."
              className="w-full p-3 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Notes / Commentaires</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajoutez des notes pour ce rappel..."
              rows={3}
              className="w-full p-3 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground resize-vertical"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" type="button" onClick={handleClose}>
              Annuler
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading || !selectedClient || !selectedDate || !scheduledTime}
            >
              {loading ? 'Création...' : '✓ Planifier le rappel'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCallbackModal;
