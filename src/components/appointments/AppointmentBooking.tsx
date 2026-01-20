import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Phone, Video, X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, isSameDay, parseISO, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import Button from '@/components/finom/Button';
import Card from '@/components/finom/Card';
import { useToast } from '@/components/finom/Toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface AppointmentBookingProps {
  agentId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

type AppointmentType = 'phone' | 'video';

interface TimeSlot {
  time: string;
  available: boolean;
}

const WORKING_HOURS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  agentId,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [step, setStep] = useState<'type' | 'date' | 'time' | 'confirm'>('type');
  const [appointmentType, setAppointmentType] = useState<AppointmentType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState('Consultation crédit immobilier');

  // Fetch booked slots for the selected date
  useEffect(() => {
    if (!selectedDate || !agentId) return;

    const fetchBookedSlots = async () => {
      setLoading(true);
      try {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
          .from('appointments')
          .select('scheduled_at')
          .eq('agent_id', agentId)
          .gte('scheduled_at', startOfDay.toISOString())
          .lte('scheduled_at', endOfDay.toISOString())
          .neq('status', 'cancelled');

        if (error) throw error;

        const booked = data?.map(a => {
          const date = parseISO(a.scheduled_at);
          return format(date, 'HH:mm');
        }) || [];

        setBookedSlots(booked);
      } catch (error) {
        console.error('Error fetching booked slots:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookedSlots();
  }, [selectedDate, agentId]);

  // Generate week days
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(currentWeekStart, i);
      // Skip weekends
      if (day.getDay() !== 0 && day.getDay() !== 6) {
        days.push(day);
      }
    }
    return days;
  }, [currentWeekStart]);

  // Generate time slots for selected date
  const timeSlots: TimeSlot[] = useMemo(() => {
    if (!selectedDate) return [];

    const now = new Date();
    const isToday = isSameDay(selectedDate, now);

    return WORKING_HOURS.map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const slotTime = setMinutes(setHours(selectedDate, hours), minutes);
      
      const isPast = isToday && slotTime <= now;
      const isBooked = bookedSlots.includes(time);

      return {
        time,
        available: !isPast && !isBooked
      };
    });
  }, [selectedDate, bookedSlots]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !appointmentType || !agentId || !user) return;

    setSubmitting(true);
    try {
      const [hoursStr, minutesStr] = selectedTime.split(':');
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      const scheduledAt = setMinutes(setHours(selectedDate, hours), minutes);

      const { error } = await supabase
        .from('appointments')
        .insert({
          client_id: user.id,
          agent_id: agentId,
          scheduled_at: scheduledAt.toISOString(),
          appointment_type: appointmentType,
          subject,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Rendez-vous réservé ! Votre conseiller vous contactera à l\'heure convenue.');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Impossible de réserver ce créneau. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const canGoToNextStep = () => {
    switch (step) {
      case 'type': return appointmentType !== null;
      case 'date': return selectedDate !== null;
      case 'time': return selectedTime !== null;
      default: return true;
    }
  };

  const goToNextStep = () => {
    if (step === 'type') setStep('date');
    else if (step === 'date') setStep('time');
    else if (step === 'time') setStep('confirm');
  };

  const goToPrevStep = () => {
    if (step === 'date') setStep('type');
    else if (step === 'time') setStep('date');
    else if (step === 'confirm') setStep('time');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step !== 'type' && (
              <button onClick={goToPrevStep} className="p-1 hover:bg-muted rounded-full">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="font-semibold text-foreground">Prendre rendez-vous</h2>
              <p className="text-xs text-muted-foreground">
                {step === 'type' && 'Choisissez le type de rendez-vous'}
                {step === 'date' && 'Sélectionnez une date'}
                {step === 'time' && 'Choisissez un créneau'}
                {step === 'confirm' && 'Confirmez votre réservation'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-4 py-2 flex gap-1">
          {['type', 'date', 'time', 'confirm'].map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                i <= ['type', 'date', 'time', 'confirm'].indexOf(step)
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <AnimatePresence mode="wait">
            {/* Step 1: Type */}
            {step === 'type' && (
              <motion.div
                key="type"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid gap-3"
              >
                <button
                  onClick={() => setAppointmentType('phone')}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left ${
                    appointmentType === 'phone'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    appointmentType === 'phone' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Appel téléphonique</p>
                    <p className="text-sm text-muted-foreground">Votre conseiller vous appellera</p>
                  </div>
                  {appointmentType === 'phone' && (
                    <Check className="w-5 h-5 text-primary ml-auto" />
                  )}
                </button>

                <button
                  onClick={() => setAppointmentType('video')}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left ${
                    appointmentType === 'video'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    appointmentType === 'video' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Visioconférence</p>
                    <p className="text-sm text-muted-foreground">Rendez-vous vidéo avec partage d'écran</p>
                  </div>
                  {appointmentType === 'video' && (
                    <Check className="w-5 h-5 text-primary ml-auto" />
                  )}
                </button>
              </motion.div>
            )}

            {/* Step 2: Date */}
            {step === 'date' && (
              <motion.div
                key="date"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, -1))}
                    className="p-2 hover:bg-muted rounded-full"
                    disabled={currentWeekStart <= startOfWeek(new Date(), { weekStartsOn: 1 })}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="font-medium">
                    {format(currentWeekStart, 'd MMM', { locale: fr })} - {format(addDays(currentWeekStart, 6), 'd MMM yyyy', { locale: fr })}
                  </span>
                  <button
                    onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
                    className="p-2 hover:bg-muted rounded-full"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {weekDays.map(day => {
                    const isPast = day < new Date() && !isSameDay(day, new Date());
                    const isSelected = selectedDate && isSameDay(day, selectedDate);

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => !isPast && setSelectedDate(day)}
                        disabled={isPast}
                        className={`p-3 rounded-xl text-center transition-all ${
                          isPast
                            ? 'opacity-40 cursor-not-allowed'
                            : isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted border border-border'
                        }`}
                      >
                        <p className="text-xs uppercase">
                          {format(day, 'EEE', { locale: fr })}
                        </p>
                        <p className="text-lg font-semibold">
                          {format(day, 'd')}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3: Time */}
            {step === 'time' && (
              <motion.div
                key="time"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="text-sm text-muted-foreground mb-4">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {selectedDate && format(selectedDate, 'EEEE d MMMM', { locale: fr })}
                </p>

                {loading ? (
                  <div className="grid grid-cols-3 gap-2">
                    {Array(9).fill(0).map((_, i) => (
                      <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map(slot => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                          !slot.available
                            ? 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                            : selectedTime === slot.time
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border hover:border-primary/50'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4: Confirm */}
            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-3 mb-4">
                    {appointmentType === 'phone' ? (
                      <Phone className="w-5 h-5 text-primary" />
                    ) : (
                      <Video className="w-5 h-5 text-primary" />
                    )}
                    <span className="font-medium text-primary">
                      {appointmentType === 'phone' ? 'Appel téléphonique' : 'Visioconférence'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedDate && format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedTime}</span>
                    </div>
                  </div>
                </Card>

                <div>
                  <label className="block text-sm font-medium mb-2">Sujet du rendez-vous</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Ex: Question sur mon dossier"
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  En confirmant, vous acceptez que votre conseiller vous contacte à l'heure convenue. 
                  Vous recevrez un rappel par notification.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          {step === 'confirm' ? (
            <Button
              variant="primary"
              className="w-full"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Réservation...' : 'Confirmer le rendez-vous'}
            </Button>
          ) : (
            <Button
              variant="primary"
              className="w-full"
              onClick={goToNextStep}
              disabled={!canGoToNextStep()}
            >
              Continuer
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AppointmentBooking;
