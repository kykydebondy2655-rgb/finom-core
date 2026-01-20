import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Button from '@/components/finom/Button';
import { useToast } from '@/components/finom/Toast';
import { profilesApi, formatCurrency } from '@/services/api';
import type { Profile } from '@/services/api';
import logger from '@/lib/logger';
import { User, Mail, Phone, MapPin, Building, Euro, FileText, Globe } from 'lucide-react';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Profile;
  onSuccess: (updatedClient: Profile) => void;
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

const EditClientModal: React.FC<EditClientModalProps> = ({ isOpen, onClose, client, onSuccess }) => {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  
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
      const updates: Record<string, unknown> = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        postal_code: formData.postal_code.trim() || null,
        country: formData.country.trim() || 'France',
        property_price: formData.property_price ? parseFloat(formData.property_price) : null,
        down_payment: formData.down_payment.trim() || null,
        purchase_type: formData.purchase_type || null,
        lead_source: formData.lead_source || null,
        pipeline_stage: formData.pipeline_stage || null,
        lead_status: formData.lead_status || null,
        kyc_status: formData.kyc_status || null,
        kyc_level: formData.kyc_level ? parseInt(formData.kyc_level) : null,
      };

      const updatedClient = await profilesApi.update(client.id, updates);
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
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
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

          {/* Projet immobilier */}
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

          {/* Statuts */}
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
