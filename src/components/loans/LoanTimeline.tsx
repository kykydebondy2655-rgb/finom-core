import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Circle, AlertCircle } from 'lucide-react';
import { LOAN_STATUS_DEFINITIONS, type LoanStatus } from '@/lib/loanStatusMachine';

interface LoanTimelineProps {
  currentStatus: string | null;
  statusHistory?: Array<{
    new_status: string;
    created_at: string;
    notes?: string | null;
  }>;
}

// Order of statuses in the timeline (excluding rejected)
const TIMELINE_ORDER: LoanStatus[] = [
  'pending',
  'documents_required',
  'under_review',
  'processing',
  'offer_issued',
  'approved',
  'funded'
];

const LoanTimeline: React.FC<LoanTimelineProps> = ({ currentStatus, statusHistory = [] }) => {
  const currentIndex = TIMELINE_ORDER.indexOf(currentStatus as LoanStatus);
  const isRejected = currentStatus === 'rejected';

  // Build history map for quick lookup
  const historyMap = new Map<string, { date: string; notes?: string | null }>();
  statusHistory.forEach(h => {
    if (!historyMap.has(h.new_status)) {
      historyMap.set(h.new_status, { date: h.created_at, notes: h.notes });
    }
  });

  const getStatusState = (status: LoanStatus, index: number) => {
    if (isRejected) {
      const wasReached = historyMap.has(status);
      return wasReached ? 'completed' : 'disabled';
    }
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'pending';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="py-6">
      {isRejected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <div>
            <p className="font-medium text-destructive">Dossier rejeté</p>
            <p className="text-sm text-muted-foreground">
              Ce dossier n'a pas pu aboutir. Contactez votre conseiller pour plus d'informations.
            </p>
          </div>
        </motion.div>
      )}

      {/* Desktop Timeline */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Progress bar */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
          <motion.div
            className="absolute top-5 left-0 h-0.5 bg-primary"
            initial={{ width: 0 }}
            animate={{ 
              width: isRejected 
                ? '0%' 
                : `${Math.max(0, (currentIndex / (TIMELINE_ORDER.length - 1)) * 100)}%` 
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {TIMELINE_ORDER.map((status, index) => {
              const definition = LOAN_STATUS_DEFINITIONS.find(s => s.value === status);
              const state = getStatusState(status, index);
              const historyEntry = historyMap.get(status);

              return (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / TIMELINE_ORDER.length}%` }}
                >
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center z-10
                      ${state === 'completed' ? 'bg-primary text-primary-foreground' : ''}
                      ${state === 'current' ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : ''}
                      ${state === 'pending' ? 'bg-muted text-muted-foreground border-2 border-border' : ''}
                      ${state === 'disabled' ? 'bg-muted/50 text-muted-foreground/50' : ''}
                    `}
                  >
                    {state === 'completed' ? (
                      <Check className="w-5 h-5" />
                    ) : state === 'current' ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <Clock className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </motion.div>

                  {/* Label */}
                  <div className="mt-3 text-center">
                    <p className={`text-xs font-medium ${
                      state === 'current' ? 'text-primary' : 
                      state === 'completed' ? 'text-foreground' : 
                      'text-muted-foreground'
                    }`}>
                      {definition?.label}
                    </p>
                    {historyEntry && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatDate(historyEntry.date)}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Timeline - Vertical */}
      <div className="md:hidden space-y-0">
        {TIMELINE_ORDER.map((status, index) => {
          const definition = LOAN_STATUS_DEFINITIONS.find(s => s.value === status);
          const state = getStatusState(status, index);
          const historyEntry = historyMap.get(status);
          const isLast = index === TIMELINE_ORDER.length - 1;

          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="relative flex gap-4"
            >
              {/* Connector line */}
              {!isLast && (
                <div className="absolute left-5 top-10 w-0.5 h-full -translate-x-1/2">
                  <div className="w-full h-full bg-border" />
                  {state === 'completed' && (
                    <motion.div
                      className="absolute top-0 left-0 w-full bg-primary"
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    />
                  )}
                </div>
              )}

              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, type: 'spring' }}
                className={`
                  relative z-10 w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center
                  ${state === 'completed' ? 'bg-primary text-primary-foreground' : ''}
                  ${state === 'current' ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : ''}
                  ${state === 'pending' ? 'bg-muted text-muted-foreground border-2 border-border' : ''}
                  ${state === 'disabled' ? 'bg-muted/50 text-muted-foreground/50' : ''}
                `}
              >
                {state === 'completed' ? (
                  <Check className="w-5 h-5" />
                ) : state === 'current' ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Clock className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </motion.div>

              {/* Content */}
              <div className={`flex-1 pb-8 ${isLast ? 'pb-0' : ''}`}>
                <div className={`
                  p-3 rounded-xl transition-colors
                  ${state === 'current' ? 'bg-primary/5 border border-primary/20' : ''}
                `}>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${
                      state === 'current' ? 'text-primary' : 
                      state === 'completed' ? 'text-foreground' : 
                      'text-muted-foreground'
                    }`}>
                      {definition?.label}
                    </p>
                    {historyEntry && (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(historyEntry.date)}
                      </span>
                    )}
                  </div>
                  {definition?.description && state !== 'pending' && state !== 'disabled' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {definition.description}
                    </p>
                  )}
                  {historyEntry?.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      "{historyEntry.notes}"
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LoanTimeline;
