/**
 * Email Service - Interface pour l'envoi d'emails via Edge Function
 * Includes automatic logging to email_logs table
 */

import { supabase } from '@/integrations/supabase/client';
import logger from '@/lib/logger';

export type EmailTemplate = 
  | 'welcome'
  | 'accountOpening'
  | 'passwordReset'
  | 'loanSubmitted'
  | 'loanApproved'
  | 'loanRejected'
  | 'loanOfferIssued'
  | 'documentRequired'
  | 'documentValidated'
  | 'documentRejected'
  | 'callbackReminder'
  | 'notification'
  | 'transferCompleted';

interface SendEmailParams {
  template: EmailTemplate;
  to: string;
  data: Record<string, unknown>;
}

interface EmailResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Log email to email_logs table
 */
async function logEmail(params: {
  template: EmailTemplate;
  recipientEmail: string;
  subject?: string;
  status: 'sent' | 'error';
  errorMessage?: string;
  clientId?: string;
  loanId?: string;
  documentId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Only log if we have a valid user (agent/admin context)
    if (!user) return;
    
    // Use raw insert to avoid type issues with newly created table
    await supabase.from('email_logs' as any).insert({
      user_id: user.id,
      recipient_email: params.recipientEmail,
      template: params.template,
      subject: params.subject || null,
      status: params.status,
      error_message: params.errorMessage || null,
      sent_by: user.id,
      client_id: params.clientId || null,
      loan_id: params.loanId || null,
      document_id: params.documentId || null,
      metadata: params.metadata || null
    } as any);
  } catch (err) {
    // Don't throw - logging failure shouldn't block email sending
    logger.warn('Failed to log email', { error: err });
  }
}

export const emailService = {
  /**
   * Envoie un email via l'edge function avec logging automatique
   */
  async send(params: SendEmailParams, loggingContext?: {
    clientId?: string;
    loanId?: string;
    documentId?: string;
    subject?: string;
  }): Promise<EmailResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: params,
      });

      if (error) {
        logger.warn('Email send error', { error: error.message });
        
        // Log failed email
        await logEmail({
          template: params.template,
          recipientEmail: params.to,
          subject: loggingContext?.subject,
          status: 'error',
          errorMessage: error.message,
          clientId: loggingContext?.clientId,
          loanId: loggingContext?.loanId,
          documentId: loggingContext?.documentId,
          metadata: params.data
        });
        
        return { success: false, error: error.message };
      }

      // Log successful email
      await logEmail({
        template: params.template,
        recipientEmail: params.to,
        subject: loggingContext?.subject,
        status: 'sent',
        clientId: loggingContext?.clientId,
        loanId: loggingContext?.loanId,
        documentId: loggingContext?.documentId,
        metadata: params.data
      });

      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.warn('Email service error', { error: errorMessage });
      
      // Log failed email
      await logEmail({
        template: params.template,
        recipientEmail: params.to,
        subject: loggingContext?.subject,
        status: 'error',
        errorMessage,
        clientId: loggingContext?.clientId,
        loanId: loggingContext?.loanId,
        documentId: loggingContext?.documentId,
        metadata: params.data
      });
      
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Email de bienvenue
   */
  async sendWelcome(email: string, firstName: string): Promise<EmailResponse> {
    return this.send({
      template: 'welcome',
      to: email,
      data: { firstName, email },
    });
  },

  /**
   * Email d'ouverture de compte avec identifiants
   */
  async sendAccountOpening(
    email: string,
    firstName: string,
    tempPassword: string,
    loginUrl?: string
  ): Promise<EmailResponse> {
    return this.send({
      template: 'accountOpening',
      to: email,
      data: { firstName, email, tempPassword, loginUrl: loginUrl || 'https://pret-finom.co/login' },
    });
  },

  /**
   * Email de demande de prêt soumise
   */
  async sendLoanSubmitted(
    email: string,
    firstName: string,
    loanId: string,
    amount: number,
    duration: number,
    monthlyPayment: number
  ): Promise<EmailResponse> {
    return this.send({
      template: 'loanSubmitted',
      to: email,
      data: { firstName, loanId, amount, duration, monthlyPayment },
    });
  },

  /**
   * Email de prêt approuvé
   */
  async sendLoanApproved(
    email: string,
    firstName: string,
    loanId: string,
    amount: number,
    rate: number,
    monthlyPayment: number
  ): Promise<EmailResponse> {
    return this.send({
      template: 'loanApproved',
      to: email,
      data: { firstName, loanId, amount, rate, monthlyPayment },
    });
  },

  /**
   * Email d'offre de prêt émise (délai légal 10 jours)
   */
  async sendLoanOfferIssued(
    email: string,
    firstName: string,
    loanId: string,
    amount: number,
    rate: number,
    monthlyPayment: number
  ): Promise<EmailResponse> {
    return this.send({
      template: 'loanOfferIssued',
      to: email,
      data: { 
        firstName, 
        loanId, 
        amount, 
        rate, 
        monthlyPayment,
        reflectionPeriod: 10 
      },
    });
  },

  /**
   * Email de prêt refusé
   */
  async sendLoanRejected(
    email: string,
    firstName: string,
    loanId: string,
    reason?: string
  ): Promise<EmailResponse> {
    return this.send({
      template: 'loanRejected',
      to: email,
      data: { firstName, loanId, reason },
    });
  },

  /**
   * Email de documents requis
   */
  async sendDocumentRequired(
    email: string,
    firstName: string,
    loanId: string,
    documents: string[]
  ): Promise<EmailResponse> {
    return this.send({
      template: 'documentRequired',
      to: email,
      data: { firstName, loanId, documents },
    });
  },

  /**
   * Email de rappel de callback
   */
  async sendCallbackReminder(
    email: string,
    firstName: string,
    scheduledAt: string,
    agentName: string
  ): Promise<EmailResponse> {
    return this.send({
      template: 'callbackReminder',
      to: email,
      data: { firstName, scheduledAt, agentName },
    });
  },

  /**
   * Email de notification générique
   */
  async sendNotification(
    email: string,
    firstName: string,
    title: string,
    message: string,
    ctaText?: string,
    ctaUrl?: string
  ): Promise<EmailResponse> {
    return this.send({
      template: 'notification',
      to: email,
      data: { firstName, title, message, ctaText, ctaUrl },
    });
  },

  /**
   * Email de virement effectué
   */
  async sendTransferCompleted(
    email: string,
    firstName: string,
    amount: number,
    beneficiary: string,
    reference?: string
  ): Promise<EmailResponse> {
    return this.send({
      template: 'transferCompleted',
      to: email,
      data: { firstName, amount, beneficiary, reference },
    });
  },

  /**
   * Email de réinitialisation de mot de passe
   */
  async sendPasswordReset(
    email: string,
    firstName: string,
    resetLink: string
  ): Promise<EmailResponse> {
    return this.send({
      template: 'passwordReset',
      to: email,
      data: { firstName, email, resetLink },
    });
  },

  /**
   * Email de document validé
   */
  async sendDocumentValidated(
    email: string,
    firstName: string,
    documentName: string,
    loanId?: string
  ): Promise<EmailResponse> {
    return this.send({
      template: 'documentValidated',
      to: email,
      data: { firstName, documentName, loanId },
    });
  },

  /**
   * Email de document rejeté
   */
  async sendDocumentRejected(
    email: string,
    firstName: string,
    documentName: string,
    rejectionReason?: string,
    loanId?: string
  ): Promise<EmailResponse> {
    return this.send({
      template: 'documentRejected',
      to: email,
      data: { firstName, documentName, rejectionReason, loanId },
    });
  },
};

export default emailService;
