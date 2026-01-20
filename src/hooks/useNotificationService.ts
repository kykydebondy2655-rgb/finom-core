/**
 * Unified Notification Service Hook
 * Centralizes in-app notifications and email sending
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { emailService, type EmailTemplate } from '@/services/emailService';
import { useAuth } from '@/context/AuthContext';
import logger from '@/lib/logger';

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'loan' | 'document' | 'system' | 'assignment' | 'callback';
  relatedEntity?: string;
  relatedId?: string;
}

export interface EmailPayload {
  template: EmailTemplate;
  to: string;
  data: Record<string, unknown>;
}

export interface LoanEmailData {
  email: string;
  firstName: string;
  loanId: string;
  amount?: number;
  rate?: number;
  monthlyPayment?: number;
  duration?: number;
  reason?: string;
}

export interface DocumentEmailData {
  email: string;
  firstName: string;
  documentName: string;
  loanId?: string;
  rejectionReason?: string;
}

export interface UseNotificationServiceReturn {
  // In-app notifications
  sendNotification: (payload: NotificationPayload) => Promise<boolean>;
  sendBulkNotifications: (payloads: NotificationPayload[]) => Promise<number>;
  
  // Email notifications
  sendEmail: (payload: EmailPayload) => Promise<boolean>;
  
  // Combined loan notifications
  notifyLoanStatusChange: (
    status: string,
    data: LoanEmailData,
    sendEmail?: boolean
  ) => Promise<boolean>;
  
  // Combined document notifications
  notifyDocumentStatusChange: (
    status: string,
    data: DocumentEmailData,
    userId: string,
    sendEmail?: boolean
  ) => Promise<boolean>;
  
  // Assignment notifications
  notifyLeadAssignment: (
    agentId: string,
    agentEmail: string,
    agentName: string,
    leadCount: number
  ) => Promise<boolean>;
}

/**
 * Hook to centralize all notification logic
 * Handles both in-app notifications (Supabase) and transactional emails (Resend)
 */
export function useNotificationService(): UseNotificationServiceReturn {
  const { user } = useAuth();

  /**
   * Create an in-app notification
   */
  const sendNotification = useCallback(async (payload: NotificationPayload): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: payload.userId,
          title: payload.title,
          message: payload.message,
          type: payload.type,
          category: payload.category,
          related_entity: payload.relatedEntity || null,
          related_id: payload.relatedId || null,
          read: false,
        });

      if (error) {
        logger.warn('Failed to create notification', { error: error.message });
        return false;
      }

      return true;
    } catch (err) {
      logger.logError('Notification service error', err);
      return false;
    }
  }, []);

  /**
   * Send multiple notifications at once
   */
  const sendBulkNotifications = useCallback(async (payloads: NotificationPayload[]): Promise<number> => {
    if (payloads.length === 0) return 0;

    try {
      const records = payloads.map(p => ({
        user_id: p.userId,
        title: p.title,
        message: p.message,
        type: p.type,
        category: p.category,
        related_entity: p.relatedEntity || null,
        related_id: p.relatedId || null,
        read: false,
      }));

      const { data, error } = await supabase
        .from('notifications')
        .insert(records)
        .select('id');

      if (error) {
        logger.warn('Failed to create bulk notifications', { error: error.message });
        return 0;
      }

      return data?.length || 0;
    } catch (err) {
      logger.logError('Bulk notification error', err);
      return 0;
    }
  }, []);

  /**
   * Send an email via the edge function
   */
  const sendEmail = useCallback(async (payload: EmailPayload): Promise<boolean> => {
    try {
      const result = await emailService.send(payload);
      return result.success;
    } catch (err) {
      logger.logError('Email service error', err);
      return false;
    }
  }, []);

  /**
   * Combined notification for loan status changes
   * Creates in-app notification and optionally sends email
   */
  const notifyLoanStatusChange = useCallback(async (
    status: string,
    data: LoanEmailData,
    sendEmailFlag = true
  ): Promise<boolean> => {
    // Fetch user ID from email if not provided
    let userId: string | null = null;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .single();
      userId = profile?.id || null;
    } catch {
      // Continue without user ID
    }

    // Status-specific notification content
    const notificationMap: Record<string, { title: string; message: string; type: 'success' | 'warning' | 'error' | 'info' }> = {
      pending: { 
        title: 'Dossier reçu', 
        message: 'Votre demande de prêt a été reçue et est en attente de traitement.',
        type: 'info'
      },
      documents_required: { 
        title: 'Documents requis', 
        message: 'Des documents supplémentaires sont nécessaires pour traiter votre dossier.',
        type: 'warning'
      },
      under_review: { 
        title: 'Dossier en analyse', 
        message: 'Votre dossier est actuellement en cours d\'analyse par nos équipes.',
        type: 'info'
      },
      processing: { 
        title: 'Dossier en traitement', 
        message: 'Votre dossier est en cours de traitement final.',
        type: 'info'
      },
      offer_issued: { 
        title: 'Offre de prêt émise', 
        message: 'Une offre de prêt vous a été envoyée. Vous disposez de 10 jours pour l\'accepter.',
        type: 'success'
      },
      approved: { 
        title: 'Prêt approuvé', 
        message: `Félicitations ! Votre prêt de ${data.amount ? data.amount.toLocaleString() : ''} € a été approuvé.`,
        type: 'success'
      },
      rejected: { 
        title: 'Dossier non retenu', 
        message: data.reason || 'Votre dossier n\'a pas pu être accepté.',
        type: 'error'
      },
      funded: { 
        title: 'Prêt financé', 
        message: 'Les fonds ont été débloqués. Votre financement est maintenant actif.',
        type: 'success'
      },
    };

    const notifContent = notificationMap[status];

    // Create in-app notification
    if (userId && notifContent) {
      await sendNotification({
        userId,
        title: notifContent.title,
        message: notifContent.message,
        type: notifContent.type,
        category: 'loan',
        relatedEntity: 'loan_applications',
        relatedId: data.loanId,
      });
    }

    // Send email based on status
    if (sendEmailFlag) {
      switch (status) {
        case 'approved':
          await emailService.sendLoanApproved(
            data.email,
            data.firstName,
            data.loanId,
            data.amount || 0,
            data.rate || 0,
            data.monthlyPayment || 0
          );
          break;
        case 'rejected':
          await emailService.sendLoanRejected(
            data.email,
            data.firstName,
            data.loanId,
            data.reason
          );
          break;
        case 'offer_issued':
          await emailService.sendLoanOfferIssued(
            data.email,
            data.firstName,
            data.loanId,
            data.amount || 0,
            data.rate || 0,
            data.monthlyPayment || 0
          );
          break;
        case 'pending':
          await emailService.sendLoanSubmitted(
            data.email,
            data.firstName,
            data.loanId,
            data.amount || 0,
            data.duration || 0,
            data.monthlyPayment || 0
          );
          break;
        // Other statuses don't trigger emails by default
      }
    }

    return true;
  }, [sendNotification]);

  /**
   * Combined notification for document status changes
   */
  const notifyDocumentStatusChange = useCallback(async (
    status: string,
    data: DocumentEmailData,
    userId: string,
    sendEmailFlag = true
  ): Promise<boolean> => {
    // Status-specific content
    const notificationMap: Record<string, { title: string; message: string; type: 'success' | 'warning' | 'error' | 'info' }> = {
      received: { 
        title: 'Document reçu', 
        message: `Votre document "${data.documentName}" a été reçu.`,
        type: 'info'
      },
      under_review: { 
        title: 'Document en analyse', 
        message: `Votre document "${data.documentName}" est en cours de vérification.`,
        type: 'info'
      },
      validated: { 
        title: 'Document validé', 
        message: `Votre document "${data.documentName}" a été validé.`,
        type: 'success'
      },
      rejected: { 
        title: 'Document rejeté', 
        message: `Votre document "${data.documentName}" a été rejeté. ${data.rejectionReason || ''}`,
        type: 'error'
      },
    };

    const notifContent = notificationMap[status];

    // Create in-app notification
    if (userId && notifContent) {
      await sendNotification({
        userId,
        title: notifContent.title,
        message: notifContent.message,
        type: notifContent.type,
        category: 'document',
        relatedEntity: 'documents',
        relatedId: data.loanId,
      });
    }

    // Send email
    if (sendEmailFlag) {
      switch (status) {
        case 'validated':
          await emailService.sendDocumentValidated(
            data.email,
            data.firstName,
            data.documentName,
            data.loanId
          );
          break;
        case 'rejected':
          await emailService.sendDocumentRejected(
            data.email,
            data.firstName,
            data.documentName,
            data.rejectionReason,
            data.loanId
          );
          break;
      }
    }

    return true;
  }, [sendNotification]);

  /**
   * Notify agent of new lead assignment
   */
  const notifyLeadAssignment = useCallback(async (
    agentId: string,
    agentEmail: string,
    agentName: string,
    leadCount: number
  ): Promise<boolean> => {
    // In-app notification
    await sendNotification({
      userId: agentId,
      title: 'Nouveaux leads assignés',
      message: `${leadCount} nouveau(x) lead(s) vous ont été assigné(s).`,
      type: 'info',
      category: 'assignment',
    });

    // Email notification
    await emailService.sendNotification(
      agentEmail,
      agentName,
      'Nouveaux leads assignés',
      `${leadCount} nouveau(x) lead(s) vous ont été assigné(s). Connectez-vous pour les consulter.`,
      'Voir mes leads',
      'https://pret-finom.co/agent/clients'
    );

    return true;
  }, [sendNotification]);

  return {
    sendNotification,
    sendBulkNotifications,
    sendEmail,
    notifyLoanStatusChange,
    notifyDocumentStatusChange,
    notifyLeadAssignment,
  };
}

export default useNotificationService;
