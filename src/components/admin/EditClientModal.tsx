import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Button from '@/components/finom/Button';
import { useToast } from '@/components/finom/Toast';
import { profilesApi } from '@/services/api';
import type { Profile } from '@/services/api';
import logger from '@/lib/logger';
import { User, Mail, Phone, MapPin, Building, Euro, Globe, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Profile;
  onSuccess: (updatedClient: Profile) => void;
  isAdmin?: boolean; // true = full access, false = agent restricted access
}

const PIPELINE_STAGES = [
  { value: 'nouveau', label: 'Nouveau' },
  { value: 'contacte', label: 'Contacté' },
  { value: 'qualifie', label: 'Qualifié' },
  { value: 'proposition', label: 'Proposition' },
  { value: 'negociation', label: 'Négociation' },
  { value: 'a_rappeler', label: 'À rappeler' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'perdu', label: 'Perdu' },
  { value: 'gagne', label: 'Gagné' },
];

const LEAD_STATUSES = [
  { value: 'nouveau', label: 'Nouveau' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'qualifie', label: 'Qualifié' },
  { value: 'converti', label: 'Converti' },
  { value: 'perdu', label: 'Perdu' },
];

const KYC_STATUSES = [
  { value: 'pending', label: 'En attente' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'verified', label: 'Vérifié' },
  { value: 'rejected', label: 'Rejeté' },
];

const PURCHASE_TYPES = [
  { value: 'residence_principale', label: 'Résidence principale' },
  { value: 'residence_secondaire', label: 'Résidence secondaire' },
  { value: 'investissement_locatif', label: 'Investissement locatif' },
  { value: 'autre', label: 'Autre' },
];

const LEAD_SOURCES = [
  { value: 'website', label: 'Site web' },
  { value: 'referral', label: 'Recommandation' },
  { value: 'advertising', label: 'Publicité' },
  { value: 'social', label: 'Réseaux sociaux' },
  { value: 'import', label: 'Import CSV' },
  { value: 'other', label: 'Autre' },
];

const EditClientModal: React.FC<EditClientModalProps> = ({ isOpen, onClose, client, onSuccess, isAdmin = true }) => {
  const toast = useToast();
  const { user } = useAuth();
  const { notifyProfileModifiedByAgent } = useAdminNotifications();
  const [saving, setSaving] = useState(false);

  // Fields agents CAN edit (restricted mode)
  const AGENT_EDITABLE_FIELDS = ['first_name', 'last_name', 'phone', 'address', 'city', 'postal_code', 'country'];

  const canEditField = (field: string): boolean => {
    if (isAdmin) return true;
    return AGENT_EDITABLE_FIELDS.includes(field);
  };
  
  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    property_price: '',
    down_payment: '',
    purchase_type: '',
    lead_source: '',
    pipeline_stage: '',
    lead_status: '',
    kyc_status: '',
    kyc_level: '',
  });

  useEffect(() => {
    if (client && isOpen) {
      setFormData({
        first_name: client.first_name || '',
        last_name: client.last_name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        city: client.city || '',
        postal_code: client.postal_code || '',
        country: client.country || 'France',
        property_price: client.property_price?.toString() || '',
        down_payment: client.down_payment || '',
        purchase_type: client.purchase_type || '',
        lead_source: client.lead_source || '',
        pipeline_stage: client.pipeline_stage || '',
        lead_status: client.lead_status || '',
        kyc_status: client.kyc_status || '',
        kyc_level: client.kyc_level?.toString() || '1',
      });
    }
  }, [client, isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error('Le prénom et le nom sont requis');
      return;
    }

    setSaving(true);
    try {
      // Build updates based on permissions
      const updates: Record<string, unknown> = {};
      const changedFields: string[] = [];
      const oldValues: Record<string, unknown> = {};
      const newValues: Record<string, unknown> = {};

      // Define field types for proper typing
      type FieldDef = { key: string; value: string | number | null; oldValue: string | number | null | undefined };
      
      // Always allow these fields
      const allFields: FieldDef[] = [
        { key: 'first_name', value: formData.first_name.trim(), oldValue: client.first_name },
        { key: 'last_name', value: formData.last_name.trim(), oldValue: client.last_name },
        { key: 'phone', value: formData.phone.trim() || null, oldValue: client.phone },
        { key: 'address', value: formData.address.trim() || null, oldValue: client.address },
        { key: 'city', value: formData.city.trim() || null, oldValue: client.city },
        { key: 'postal_code', value: formData.postal_code.trim() || null, oldValue: client.postal_code },
        { key: 'country', value: formData.country.trim() || 'France', oldValue: client.country },
      ];

      // Admin-only fields
      if (isAdmin) {
        allFields.push(
          { key: 'email', value: formData.email.trim() || null, oldValue: client.email },
          { key: 'property_price', value: formData.property_price ? parseFloat(formData.property_price) : null, oldValue: client.property_price ?? null },
          { key: 'down_payment', value: formData.down_payment.trim() || null, oldValue: client.down_payment },
          { key: 'purchase_type', value: formData.purchase_type || null, oldValue: client.purchase_type },
          { key: 'lead_source', value: formData.lead_source || null, oldValue: client.lead_source },
          { key: 'pipeline_stage', value: formData.pipeline_stage || null, oldValue: client.pipeline_stage },
          { key: 'lead_status', value: formData.lead_status || null, oldValue: client.lead_status },
          { key: 'kyc_status', value: formData.kyc_status || null, oldValue: client.kyc_status },
          { key: 'kyc_level', value: formData.kyc_level ? parseInt(formData.kyc_level) : null, oldValue: client.kyc_level ?? null },
        );
      }

      // Build updates and track changes
      for (const field of allFields) {
        updates[field.key] = field.value;
        if (field.value !== field.oldValue) {
          changedFields.push(field.key);
          oldValues[field.key] = field.oldValue;
          newValues[field.key] = field.value;
        }
      }

      const updatedClient = await profilesApi.update(client.id, updates);

      // Log to audit table if there are changes
      if (changedFields.length > 0 && user) {
        try {
          // Insert using direct fetch since types haven't regenerated for the new table
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
          const { data: sessionData } = await supabase.auth.getSession();
          
          await fetch(`${supabaseUrl}/rest/v1/profile_audit_logs`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${sessionData?.session?.access_token || supabaseKey}`,
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              profile_id: client.id,
              changed_by: user.id,
              action: 'update',
              old_values: oldValues,
              new_values: newValues,
              changed_fields: changedFields,
            }),
          });

          // If agent (not admin), notify admins via email + in-app notification
          if (!isAdmin) {
            const agentName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
            const clientName = `${client.first_name || ''} ${client.last_name || ''}`.trim();
            await notifyProfileModifiedByAgent(client.id, clientName, agentName, changedFields);
          }
        } catch (auditError) {
          logger.logError('Failed to log audit', auditError);
        }
      }

      toast.success('Profil client mis à jour avec succès');
      onSuccess(updatedClient);
      onClose();
    } catch (error) {
      logger.logError('Error updating client profile', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User size={20} />
            Modifier le profil client
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-b pb-2">
              <User size={14} /> Informations personnelles
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  <Mail size={12} /> Email
                  {!canEditField('email') && <Lock size={10} className="text-muted-foreground" />}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={!canEditField('email')}
                  className={!canEditField('email') ? 'bg-muted cursor-not-allowed' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1">
                  <Phone size={12} /> Téléphone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-b pb-2">
              <MapPin size={14} /> Adresse
            </h4>
            <div className="space-y-2">
              <Label htmlFor="address">Rue</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postal_code">Code postal</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Projet immobilier - Admin only */}
          {isAdmin && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-b pb-2">
                <Building size={14} /> Projet immobilier
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property_price" className="flex items-center gap-1">
                    <Euro size={12} /> Prix du bien
                  </Label>
                  <Input
                    id="property_price"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.property_price}
                    onChange={(e) => handleChange('property_price', e.target.value)}
                    placeholder="250000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="down_payment">Apport</Label>
                  <Input
                    id="down_payment"
                    value={formData.down_payment}
                    onChange={(e) => handleChange('down_payment', e.target.value)}
                    placeholder="50000 €"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase_type">Type d'achat</Label>
                  <Select value={formData.purchase_type} onValueChange={(v) => handleChange('purchase_type', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PURCHASE_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead_source">Source</Label>
                  <Select value={formData.lead_source} onValueChange={(v) => handleChange('lead_source', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_SOURCES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Statuts - Admin only */}
          {isAdmin && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-b pb-2">
                <Globe size={14} /> Statuts & Pipeline
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pipeline_stage">Étape pipeline</Label>
                  <Select value={formData.pipeline_stage} onValueChange={(v) => handleChange('pipeline_stage', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PIPELINE_STAGES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead_status">Statut lead</Label>
                  <Select value={formData.lead_status} onValueChange={(v) => handleChange('lead_status', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kyc_status">Statut KYC</Label>
                  <Select value={formData.kyc_status} onValueChange={(v) => handleChange('kyc_status', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {KYC_STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kyc_level">Niveau KYC</Label>
                  <Select value={formData.kyc_level} onValueChange={(v) => handleChange('kyc_level', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Niveau 1</SelectItem>
                      <SelectItem value="2">Niveau 2</SelectItem>
                      <SelectItem value="3">Niveau 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientModal;
