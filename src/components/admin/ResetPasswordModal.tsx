import React, { useState, forwardRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Button from '@/components/finom/Button';
import { useToast } from '@/components/finom/Toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import logger from '@/lib/logger';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
}

const ResetPasswordModal = forwardRef<HTMLDivElement, ResetPasswordModalProps>(({
  isOpen,
  onClose,
  clientId,
  clientName,
}, ref) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('reset-client-password', {
        body: {
          targetUserId: clientId,
          newPassword,
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success('Mot de passe modifié avec succès');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (error) {
      logger.logError('Reset password error', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le mot de passe</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Définir un nouveau mot de passe pour <strong>{clientName}</strong>
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                required
                minLength={8}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Répéter le mot de passe"
              required
              minLength={8}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading && <Loader2 size={16} className="mr-2 animate-spin" />}
              Modifier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

ResetPasswordModal.displayName = 'ResetPasswordModal';

export default ResetPasswordModal;
