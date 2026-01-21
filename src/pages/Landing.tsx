import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { z } from 'zod';
import { 
  Home, 
  Calculator, 
  Euro, 
  Calendar, 
  Percent, 
  Shield, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Building2,
  TrendingDown,
  Award,
  Phone,
  Mail,
  User,
  BarChart3,
  Plus,
  Trash2,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { performSimulation, safeNumber, SimulationResult } from '@/lib/loanCalculations';
import { getRateForProfile } from '@/lib/rates';
import { supabase } from '@/integrations/supabase/client';
import { useSEO } from '@/hooks/useSEO';
import { emailService } from '@/services/emailService';

// Lead form validation schema
const leadSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis (min 2 caractères)'),
  lastName: z.string().min(2, 'Nom requis (min 2 caractères)'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide').max(15)
});

interface FormData {
  propertyPrice: number;
  notaryFees: number;
  agencyFees: number;
  worksAmount: number;
  downPayment: number;
  durationYears: number;
  rate: number;
  profile: string;
  profileLabel: string;
}

interface LeadForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Scenario {
  id: string;
  label: string;
  durationYears: number;
  downPayment: number;
  result: SimulationResult | null;
}

const Landing = () => {
  useSEO({
    title: 'Simulateur Crédit Immobilier | FINOM - Estimation Gratuite',
    description: 'Simulez votre crédit immobilier en ligne et obtenez une estimation personnalisée. Taux compétitifs, réponse sous 24h.',
    canonical: 'https://pret-finom.co/landing',
    breadcrumbs: [
      { name: 'Accueil', url: 'https://pret-finom.co/' },
      { name: 'Simulateur', url: 'https://pret-finom.co/landing' }
    ]
  });

  const [formData, setFormData] = useState<FormData>({
    propertyPrice: 250000,
    notaryFees: 20000,
    agencyFees: 5000,
    worksAmount: 0,
    downPayment: 30000,
    durationYears: 20,
    rate: 3.22,
    profile: 'standard',
    profileLabel: 'Profil Standard'
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState<LeadForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showComparator, setShowComparator] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  // Recalculate on form change
  useEffect(() => {
    calculate();
  }, [
    formData.propertyPrice,
    formData.notaryFees,
    formData.agencyFees,
    formData.worksAmount,
    formData.downPayment,
    formData.durationYears
  ]);

  // Recalculate scenarios when base params change
  useEffect(() => {
    if (scenarios.length > 0) {
      const updatedScenarios = scenarios.map(scenario => ({
        ...scenario,
        result: calculateScenario(scenario.durationYears, scenario.downPayment)
      }));
      setScenarios(updatedScenarios);
    }
  }, [formData.propertyPrice, formData.notaryFees, formData.agencyFees, formData.worksAmount]);

  const calculateScenario = (durationYears: number, downPayment: number): SimulationResult => {
    const totalProject = safeNumber(formData.propertyPrice) + safeNumber(formData.notaryFees) + 
                         safeNumber(formData.agencyFees) + safeNumber(formData.worksAmount);
    const contributionPercent = totalProject > 0 ? safeNumber(downPayment) / totalProject : 0;
    const rateData = getRateForProfile(durationYears, contributionPercent);
    
    return performSimulation({
      propertyPrice: formData.propertyPrice,
      notaryFees: formData.notaryFees,
      agencyFees: formData.agencyFees,
      worksAmount: formData.worksAmount,
      downPayment: downPayment,
      durationYears: durationYears,
      annualRate: rateData.rate
    });
  };

  const calculate = () => {
    const totalProject = safeNumber(formData.propertyPrice) + safeNumber(formData.notaryFees) + 
                         safeNumber(formData.agencyFees) + safeNumber(formData.worksAmount);
    const contributionPercent = totalProject > 0 
      ? safeNumber(formData.downPayment) / totalProject 
      : 0;

    const rateData = getRateForProfile(formData.durationYears, contributionPercent);
    
    if (rateData.rate !== formData.rate || rateData.profile !== formData.profile) {
      setFormData(prev => ({
        ...prev,
        rate: rateData.rate,
        profile: rateData.profile,
        profileLabel: rateData.profileLabel
      }));
    }

    const simulation = performSimulation({
      propertyPrice: formData.propertyPrice,
      notaryFees: formData.notaryFees,
      agencyFees: formData.agencyFees,
      worksAmount: formData.worksAmount,
      downPayment: formData.downPayment,
      durationYears: formData.durationYears,
      annualRate: rateData.rate
    });

    setResult(simulation);
  };

  const updateField = (field: keyof FormData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0 
    }).format(value);
  };

  // Scenario comparator functions
  const addScenario = () => {
    if (scenarios.length >= 3) return;
    const newScenario: Scenario = {
      id: crypto.randomUUID(),
      label: `Scénario ${scenarios.length + 1}`,
      durationYears: formData.durationYears,
      downPayment: formData.downPayment,
      result: result
    };
    setScenarios([...scenarios, newScenario]);
  };

  const removeScenario = (id: string) => {
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  const updateScenario = (id: string, field: 'durationYears' | 'downPayment', value: number) => {
    setScenarios(scenarios.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, [field]: value };
      updated.result = calculateScenario(updated.durationYears, updated.downPayment);
      return updated;
    }));
  };

  // Notify admins via email when new lead is submitted
  const notifyAdminsNewLead = async (leadData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    propertyPrice: number;
    downPayment: number;
    monthlyPayment: number;
  }) => {
    try {
      // Get all admin users
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (!adminRoles || adminRoles.length === 0) return;

      // Get admin emails
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('email, first_name')
        .in('id', adminRoles.map(r => r.user_id));

      if (!adminProfiles) return;

      // Create in-app notifications
      const notifications = adminRoles.map(admin => ({
        user_id: admin.user_id,
        type: 'new_lead',
        category: 'lead',
        title: 'Nouveau lead depuis la landing page',
        message: `${leadData.firstName} ${leadData.lastName} (${leadData.email}) - Projet: ${formatCurrency(leadData.propertyPrice)}`,
        related_entity: 'profiles',
      }));

      await supabase.from('notifications').insert(notifications);

      // Send email to each admin
      for (const admin of adminProfiles) {
        if (admin.email) {
          await emailService.sendNotification(
            admin.email,
            admin.first_name || 'Administrateur',
            '🔔 Nouveau lead - Landing Page',
            `Un nouveau prospect vient de soumettre une demande via la landing page.\n\n` +
            `**Coordonnées:**\n` +
            `- Nom: ${leadData.firstName} ${leadData.lastName}\n` +
            `- Email: ${leadData.email}\n` +
            `- Téléphone: ${leadData.phone}\n\n` +
            `**Projet:**\n` +
            `- Prix du bien: ${formatCurrency(leadData.propertyPrice)}\n` +
            `- Apport: ${formatCurrency(leadData.downPayment)}\n` +
            `- Mensualité estimée: ${formatCurrency(leadData.monthlyPayment)}\n\n` +
            `Connectez-vous pour consulter et assigner ce lead.`,
            'Voir les leads',
            'https://pret-finom.co/admin/leads'
          );
        }
      }
    } catch (err) {
      console.error('Failed to notify admins:', err);
    }
  };

  const handleSubmitLead = async () => {
    // Validate form
    const validation = leadSchema.safeParse(leadForm);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      // Check if email already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', leadForm.email)
        .maybeSingle();

      if (existingProfile) {
        toast.error('Cet email est déjà enregistré. Nous vous recontacterons bientôt.');
        setIsSubmitting(false);
        return;
      }

      // Insert lead into profiles table with lead_status
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(),
          first_name: leadForm.firstName,
          last_name: leadForm.lastName,
          email: leadForm.email,
          phone: leadForm.phone,
          role: 'client',
          lead_status: 'new',
          lead_source: 'landing_page',
          property_price: formData.propertyPrice,
          down_payment: String(formData.downPayment),
          pipeline_stage: 'lead'
        });

      if (error) throw error;

      // Notify admins (non-blocking)
      notifyAdminsNewLead({
        firstName: leadForm.firstName,
        lastName: leadForm.lastName,
        email: leadForm.email,
        phone: leadForm.phone,
        propertyPrice: formData.propertyPrice,
        downPayment: formData.downPayment,
        monthlyPayment: result?.monthlyTotal || 0
      });

      toast.success('Merci ! Un conseiller vous contactera très rapidement.');
      setShowLeadForm(false);
      setLeadForm({ firstName: '', lastName: '', email: '', phone: '' });

    } catch (err) {
      console.error('Lead submission error:', err);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const advantages = [
    { icon: TrendingDown, title: 'Taux compétitifs', description: 'Des taux parmi les plus bas du marché' },
    { icon: Clock, title: 'Réponse rapide', description: 'Étude de votre dossier sous 24h' },
    { icon: Shield, title: '100% sécurisé', description: 'Vos données sont protégées' },
    { icon: Award, title: 'Expert reconnu', description: 'Plus de 10 ans d\'expérience' }
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Calculator className="w-4 h-4" />
                Simulateur de crédit immobilier
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Votre projet immobilier<br />
                <span className="text-primary">commence ici</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Simulez votre crédit en quelques clics et obtenez une estimation personnalisée. 
                Un conseiller dédié vous accompagne dans toutes les étapes.
              </p>
            </motion.div>
          </div>

          {/* Simulator Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <Card className="shadow-2xl border-0 overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Left: Form */}
                <div className="p-6 md:p-8 bg-card">
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Home className="w-5 h-5 text-primary" />
                      Votre projet
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-6">
                    {/* Property Price */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          Prix du bien
                        </Label>
                        <span className="text-lg font-semibold text-primary">
                          {formatCurrency(formData.propertyPrice)}
                        </span>
                      </div>
                      <Slider
                        value={[formData.propertyPrice]}
                        onValueChange={([v]) => updateField('propertyPrice', v)}
                        min={50000}
                        max={1500000}
                        step={5000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>50 000 €</span>
                        <span>1 500 000 €</span>
                      </div>
                    </div>

                    {/* Down Payment */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="flex items-center gap-2">
                          <Euro className="w-4 h-4 text-muted-foreground" />
                          Apport personnel
                        </Label>
                        <span className="text-lg font-semibold text-primary">
                          {formatCurrency(formData.downPayment)}
                        </span>
                      </div>
                      <Slider
                        value={[formData.downPayment]}
                        onValueChange={([v]) => updateField('downPayment', v)}
                        min={0}
                        max={Math.max(formData.propertyPrice * 0.5, 10000)}
                        step={1000}
                        className="w-full"
                      />
                    </div>

                    {/* Duration */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          Durée du prêt
                        </Label>
                        <span className="text-lg font-semibold text-primary">
                          {formData.durationYears} ans
                        </span>
                      </div>
                      <Slider
                        value={[formData.durationYears]}
                        onValueChange={([v]) => updateField('durationYears', v)}
                        min={5}
                        max={30}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5 ans</span>
                        <span>30 ans</span>
                      </div>
                    </div>

                    {/* Additional fees collapsed */}
                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Frais de notaire</Label>
                          <Input
                            type="number"
                            value={formData.notaryFees}
                            onChange={(e) => updateField('notaryFees', Number(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Frais d'agence</Label>
                          <Input
                            type="number"
                            value={formData.agencyFees}
                            onChange={(e) => updateField('agencyFees', Number(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Right: Results */}
                <div className="p-6 md:p-8 bg-primary text-primary-foreground">
                  <div className="h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                      <Percent className="w-5 h-5" />
                      <h3 className="text-xl font-semibold">Votre estimation</h3>
                    </div>

                    {result && result.isValid ? (
                      <div className="flex-1 space-y-6">
                        {/* Monthly Payment */}
                        <div className="text-center py-6 bg-white/10 rounded-xl">
                          <p className="text-sm opacity-80 mb-2">Mensualité estimée</p>
                          <p className="text-4xl md:text-5xl font-bold">
                            {formatCurrency(result.monthlyTotal)}
                          </p>
                          <p className="text-sm opacity-80 mt-2">par mois</p>
                        </div>

                        {/* Details */}
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-white/20">
                            <span className="opacity-80">Capital emprunté</span>
                            <span className="font-semibold">{formatCurrency(result.loanAmount)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-white/20">
                            <span className="opacity-80">Taux d'intérêt</span>
                            <span className="font-semibold">{formData.rate.toFixed(2)} %</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-white/20">
                            <span className="opacity-80">Coût total du crédit</span>
                            <span className="font-semibold">{formatCurrency(result.totalInterest)}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="opacity-80">Profil</span>
                            <span className="font-semibold">{formData.profileLabel}</span>
                          </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="space-y-3">
                          <Button
                            onClick={() => setShowLeadForm(true)}
                            size="lg"
                            className="w-full bg-white text-primary hover:bg-white/90 font-semibold text-lg py-6"
                          >
                            Être recontacté
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </Button>
                          <Button
                            onClick={() => setShowComparator(!showComparator)}
                            variant="ghost"
                            className="w-full text-white/80 hover:text-white hover:bg-white/10"
                          >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            {showComparator ? 'Masquer' : 'Comparer les scénarios'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-center opacity-80">
                          Ajustez les paramètres pour voir votre estimation
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Scenario Comparator */}
      <AnimatePresence>
        {showComparator && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-muted/50 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-12">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-primary" />
                      Comparateur de scénarios
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Comparez jusqu'à 3 scénarios avec différentes durées et apports
                    </p>
                  </div>
                  {scenarios.length < 3 && (
                    <Button onClick={addScenario} variant="outline" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Ajouter un scénario
                    </Button>
                  )}
                </div>

                {scenarios.length === 0 ? (
                  <Card className="p-8 text-center">
                    <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Ajoutez des scénarios pour comparer différentes options de financement
                    </p>
                    <Button onClick={addScenario} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Créer mon premier scénario
                    </Button>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Current scenario */}
                    <Card className="border-2 border-primary">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            ✓
                          </span>
                          Actuel
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Durée</span>
                            <span className="font-medium">{formData.durationYears} ans</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Apport</span>
                            <span className="font-medium">{formatCurrency(formData.downPayment)}</span>
                          </div>
                        </div>
                        <div className="pt-4 border-t">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Mensualité</p>
                            <p className="text-2xl font-bold text-primary">
                              {result ? formatCurrency(result.monthlyTotal) : '—'}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                            <div className="text-center">
                              <p className="text-muted-foreground">Taux</p>
                              <p className="font-medium">{formData.rate.toFixed(2)}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-muted-foreground">Coût crédit</p>
                              <p className="font-medium">{result ? formatCurrency(result.totalInterest) : '—'}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Comparison scenarios */}
                    {scenarios.map((scenario, index) => (
                      <Card key={scenario.id} className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeScenario(scenario.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center">
                              {index + 1}
                            </span>
                            {scenario.label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Durée (ans)</Label>
                              <Slider
                                value={[scenario.durationYears]}
                                onValueChange={([v]) => updateScenario(scenario.id, 'durationYears', v)}
                                min={5}
                                max={30}
                                step={1}
                                className="mt-2"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>5 ans</span>
                                <span className="font-medium text-foreground">{scenario.durationYears} ans</span>
                                <span>30 ans</span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Apport</Label>
                              <Slider
                                value={[scenario.downPayment]}
                                onValueChange={([v]) => updateScenario(scenario.id, 'downPayment', v)}
                                min={0}
                                max={formData.propertyPrice * 0.5}
                                step={1000}
                                className="mt-2"
                              />
                              <div className="text-center text-xs font-medium mt-1">
                                {formatCurrency(scenario.downPayment)}
                              </div>
                            </div>
                          </div>
                          <div className="pt-4 border-t">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Mensualité</p>
                              <p className="text-2xl font-bold text-primary">
                                {scenario.result ? formatCurrency(scenario.result.monthlyTotal) : '—'}
                              </p>
                              {scenario.result && result && (
                                <p className={`text-xs mt-1 ${
                                  scenario.result.monthlyTotal < result.monthlyTotal 
                                    ? 'text-green-600' 
                                    : scenario.result.monthlyTotal > result.monthlyTotal 
                                    ? 'text-red-500'
                                    : 'text-muted-foreground'
                                }`}>
                                  {scenario.result.monthlyTotal < result.monthlyTotal 
                                    ? `−${formatCurrency(result.monthlyTotal - scenario.result.monthlyTotal)}/mois`
                                    : scenario.result.monthlyTotal > result.monthlyTotal
                                    ? `+${formatCurrency(scenario.result.monthlyTotal - result.monthlyTotal)}/mois`
                                    : 'Identique'
                                  }
                                </p>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                              <div className="text-center">
                                <p className="text-muted-foreground">Coût crédit</p>
                                <p className="font-medium">
                                  {scenario.result ? formatCurrency(scenario.result.totalInterest) : '—'}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground">Capital</p>
                                <p className="font-medium">
                                  {scenario.result ? formatCurrency(scenario.result.loanAmount) : '—'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Advantages Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              FINOM vous accompagne dans votre projet immobilier avec expertise et transparence.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {advantages.map((adv, index) => (
              <motion.div
                key={adv.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full text-center p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <adv.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{adv.title}</h3>
                  <p className="text-sm text-muted-foreground">{adv.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Shield className="w-8 h-8 text-primary" />
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Vos données sont en sécurité
            </h2>
            <p className="text-muted-foreground mb-8">
              FINOM est un établissement financier agréé, régulé par les autorités bancaires européennes.
              Vos informations personnelles sont protégées et ne sont jamais partagées avec des tiers.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Données cryptées SSL
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Conforme RGPD
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Établissement agréé
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted border-t mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div className="md:col-span-1">
                <span className="text-2xl font-bold text-primary">FINOM</span>
                <p className="text-sm text-muted-foreground mt-2">
                  Votre banque pour le crédit immobilier
                </p>
                <div className="flex gap-2 mt-4">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Treezor</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Solaris</span>
                </div>
              </div>

              {/* Crédit immobilier */}
              <div>
                <h4 className="font-semibold text-foreground mb-4">Crédit immobilier</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/simulator" className="text-muted-foreground hover:text-foreground transition-colors">Simuler mon crédit</Link></li>
                  <li><Link to="/rates" className="text-muted-foreground hover:text-foreground transition-colors">Nos taux</Link></li>
                  <li><Link to="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">Comment ça marche</Link></li>
                  <li><Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">Questions fréquentes</Link></li>
                </ul>
              </div>

              {/* Légal */}
              <div>
                <h4 className="font-semibold text-foreground mb-4">Informations légales</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/legal" className="text-muted-foreground hover:text-foreground transition-colors">Mentions légales</Link></li>
                  <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Politique de confidentialité</Link></li>
                  <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Conditions générales</Link></li>
                  <li><Link to="/security" className="text-muted-foreground hover:text-foreground transition-colors">Sécurité</Link></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-semibold text-foreground mb-4">Contact</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a href="mailto:contact@pret-finom.co" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <Mail className="w-4 h-4" />
                      contact@pret-finom.co
                    </a>
                  </li>
                  <li>
                    <a href="tel:+33187680890" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <Phone className="w-4 h-4" />
                      01 87 68 08 90
                    </a>
                  </li>
                  <li>
                    <Link to="/install" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <Smartphone className="w-4 h-4" />
                      Installer l'application
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Regulatory info */}
            <div className="border-t pt-8 space-y-4">
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  <strong>FINOM</strong> — Établissement bancaire spécialisé en crédit immobilier. 
                  Partenaires bancaires agréés : Treezor (ACPR - France) et Solaris (BaFin - Allemagne).
                </p>
                <p>
                  Vos données sont protégées et hébergées en Europe, conformément au RGPD et aux standards bancaires.
                </p>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">© {currentYear} FINOM. Tous droits réservés.</p>
                <p className="text-xs text-muted-foreground">
                  Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Lead Form Modal */}
      <AnimatePresence>
        {showLeadForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLeadForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card className="shadow-2xl">
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Être recontacté</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Un conseiller vous rappelle sous 24h pour discuter de votre projet.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Prénom
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="Jean"
                        value={leadForm.firstName}
                        onChange={(e) => setLeadForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className={formErrors.firstName ? 'border-destructive' : ''}
                      />
                      {formErrors.firstName && (
                        <p className="text-xs text-destructive">{formErrors.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        placeholder="Dupont"
                        value={leadForm.lastName}
                        onChange={(e) => setLeadForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className={formErrors.lastName ? 'border-destructive' : ''}
                      />
                      {formErrors.lastName && (
                        <p className="text-xs text-destructive">{formErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jean.dupont@email.com"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                      className={formErrors.email ? 'border-destructive' : ''}
                    />
                    {formErrors.email && (
                      <p className="text-xs text-destructive">{formErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Téléphone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                      className={formErrors.phone ? 'border-destructive' : ''}
                    />
                    {formErrors.phone && (
                      <p className="text-xs text-destructive">{formErrors.phone}</p>
                    )}
                  </div>

                  {/* Summary */}
                  {result && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <p className="text-sm font-medium">Récapitulatif de votre simulation</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Prix du bien</span>
                          <span>{formatCurrency(formData.propertyPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Apport</span>
                          <span>{formatCurrency(formData.downPayment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Durée</span>
                          <span>{formData.durationYears} ans</span>
                        </div>
                        <div className="flex justify-between font-medium text-foreground pt-2 border-t">
                          <span>Mensualité estimée</span>
                          <span className="text-primary">{formatCurrency(result.monthlyTotal)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmitLead}
                    disabled={isSubmitting}
                    className="w-full py-6 text-lg"
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    En soumettant ce formulaire, vous acceptez d'être contacté par nos conseillers.
                    Vos données sont protégées conformément au RGPD.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;
