/**
 * Client Appointments Page
 * Displays upcoming and past appointments
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, isPast, isFuture, isToday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  CalendarPlus,
  User
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import AppointmentBooking from '@/components/appointments/AppointmentBooking';
import logger from '@/lib/logger';

interface Appointment {
  id: string;
  subject: string;
  scheduled_at: string;
  appointment_type: string | null;
  status: string | null;
  notes: string | null;
  agent: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const Appointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [assignedAgentId, setAssignedAgentId] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
    loadAssignedAgent();
  }, [user]);

  const loadAssignedAgent = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('client_assignments')
        .select('agent_user_id')
        .eq('client_user_id', user.id)
        .single();
      
      if (data) {
        setAssignedAgentId(data.agent_user_id);
      }
    } catch (err) {
      // Silent fail - user may not have an assigned agent
    }
  };

  const loadAppointments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          subject,
          scheduled_at,
          appointment_type,
          status,
          notes,
          agent:profiles!appointments_agent_id_fkey(first_name, last_name)
        `)
        .eq('client_id', user.id)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      logger.logError('Error loading appointments', err);
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    isFuture(parseISO(apt.scheduled_at)) || isToday(parseISO(apt.scheduled_at))
  );

  const pastAppointments = appointments.filter(apt => 
    isPast(parseISO(apt.scheduled_at)) && !isToday(parseISO(apt.scheduled_at))
  );

  const getStatusBadge = (status: string | null, scheduledAt: string) => {
    const isPastDate = isPast(parseISO(scheduledAt)) && !isToday(parseISO(scheduledAt));
    
    if (status === 'completed') {
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Terminé</Badge>;
    }
    if (status === 'cancelled') {
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Annulé</Badge>;
    }
    if (isPastDate && status === 'planned') {
      return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">Non confirmé</Badge>;
    }
    if (isToday(parseISO(scheduledAt))) {
      return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Aujourd'hui</Badge>;
    }
    return <Badge className="bg-primary/10 text-primary">Planifié</Badge>;
  };

  const getTypeIcon = (type: string | null) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-blue-500" />;
      case 'phone':
        return <Phone className="w-5 h-5 text-green-500" />;
      case 'in_person':
        return <MapPin className="w-5 h-5 text-orange-500" />;
      default:
        return <Calendar className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: string | null) => {
    switch (type) {
      case 'video':
        return 'Visioconférence';
      case 'phone':
        return 'Téléphone';
      case 'in_person':
        return 'En personne';
      default:
        return 'Rendez-vous';
    }
  };

  const AppointmentCard = ({ appointment, index }: { appointment: Appointment; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            {getTypeIcon(appointment.appointment_type)}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-foreground truncate">
                {appointment.subject}
              </h3>
              {getStatusBadge(appointment.status, appointment.scheduled_at)}
            </div>
            
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(parseISO(appointment.scheduled_at), 'EEEE d MMMM yyyy', { locale: fr })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {format(parseISO(appointment.scheduled_at), 'HH:mm', { locale: fr })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                  {getTypeLabel(appointment.appointment_type)}
                </span>
              </div>
              {appointment.agent && (
                <div className="flex items-center gap-2 mt-2">
                  <User className="w-4 h-4" />
                  <span>
                    Avec {appointment.agent.first_name} {appointment.agent.last_name}
                  </span>
                </div>
              )}
            </div>
            
            {appointment.notes && (
              <p className="mt-3 text-sm text-muted-foreground border-t pt-2">
                {appointment.notes}
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6 px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mes rendez-vous</h1>
            <p className="text-muted-foreground">
              Gérez vos rendez-vous avec votre conseiller
            </p>
          </div>
          {assignedAgentId && (
            <Button onClick={() => setShowBookingModal(true)}>
              <CalendarPlus className="w-4 h-4 mr-2" />
              Nouveau RDV
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{upcomingAppointments.length}</div>
            <div className="text-sm text-muted-foreground">À venir</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{pastAppointments.filter(a => a.status === 'completed').length}</div>
            <div className="text-sm text-muted-foreground">Terminés</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{upcomingAppointments.filter(a => isToday(parseISO(a.scheduled_at))).length}</div>
            <div className="text-sm text-muted-foreground">Aujourd'hui</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-muted-foreground">{appointments.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upcoming' | 'past')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              À venir ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Passés ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {upcomingAppointments.length === 0 ? (
              <EmptyState
                icon="📅"
                title="Aucun rendez-vous à venir"
                description="Vous n'avez pas de rendez-vous planifié"
                actionLabel={assignedAgentId ? "Prendre rendez-vous" : undefined}
                onAction={assignedAgentId ? () => setShowBookingModal(true) : undefined}
              />
            ) : (
              upcomingAppointments
                .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                .map((apt, index) => (
                  <AppointmentCard key={apt.id} appointment={apt} index={index} />
                ))
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4 space-y-4">
            {pastAppointments.length === 0 ? (
              <EmptyState
                icon="✅"
                title="Aucun rendez-vous passé"
                description="Vos rendez-vous passés apparaîtront ici"
              />
            ) : (
              pastAppointments.map((apt, index) => (
                <AppointmentCard key={apt.id} appointment={apt} index={index} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Modal */}
      {showBookingModal && assignedAgentId && (
        <AppointmentBooking
          agentId={assignedAgentId}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
            loadAppointments();
          }}
        />
      )}
    </PageLayout>
  );
};

export default Appointments;
