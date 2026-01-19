import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface ExportData {
  profile: Record<string, unknown>;
  loans: Record<string, unknown>[];
  documents: Record<string, unknown>[];
  notifications: Record<string, unknown>[];
  loginHistory: Record<string, unknown>[];
  exportedAt: string;
}

export const useExportProfile = (userId: string | undefined) => {
  const [exporting, setExporting] = useState(false);

  const exportData = async (): Promise<void> => {
    if (!userId || exporting) return;

    setExporting(true);

    try {
      // Fetch all user data in parallel
      const [
        profileRes,
        loansRes,
        documentsRes,
        notificationsRes,
        loginHistoryRes
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('loan_applications').select('*').eq('user_id', userId),
        supabase.from('documents').select('id, file_name, category, status, direction, uploaded_at, expires_at').eq('user_id', userId),
        supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100),
        supabase.from('login_history').select('*').eq('user_id', userId).order('logged_in_at', { ascending: false }).limit(50)
      ]);

      // Remove sensitive fields from profile
      const profile = profileRes.data ? { ...profileRes.data } : {};
      delete (profile as any).must_change_password;

      const exportPayload: ExportData = {
        profile,
        loans: loansRes.data || [],
        documents: documentsRes.data || [],
        notifications: notificationsRes.data || [],
        loginHistory: loginHistoryRes.data || [],
        exportedAt: new Date().toISOString()
      };

      // Generate and download JSON file
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finom-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      logger.logError('Error exporting profile data', err);
      throw err;
    } finally {
      setExporting(false);
    }
  };

  return { exportData, exporting };
};

export default useExportProfile;
