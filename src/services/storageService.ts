/**
 * Storage Service - Gestion des documents via Supabase Storage
 */

import { supabase } from '@/integrations/supabase/client';
import logger from '@/lib/logger';

const BUCKET_NAME = 'documents';

interface UploadResult {
  success: boolean;
  path?: string;
  url?: string;
  error?: string;
}

interface DownloadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const storageService = {
  /**
   * Upload un document pour un utilisateur
   */
  async uploadDocument(
    userId: string,
    file: File,
    loanId?: string,
    category?: string
  ): Promise<UploadResult> {
    try {
      // Créer le chemin du fichier: userId/loanId/category/filename
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const pathParts = [userId];
      
      if (loanId) pathParts.push(loanId);
      if (category) pathParts.push(category);
      pathParts.push(`${timestamp}_${safeName}`);
      
      const filePath = pathParts.join('/');

      // Upload le fichier
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        logger.warn('Storage upload error', { error: error.message });
        return { success: false, error: error.message };
      }

      // Obtenir l'URL signée (valide 1 heure)
      const { data: urlData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(data.path, 3600);

      return {
        success: true,
        path: data.path,
        url: urlData?.signedUrl,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      logger.logError('Storage upload failed', err);
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Télécharge un document (obtenir l'URL signée)
   */
  async getDocumentUrl(filePath: string, expiresIn = 3600): Promise<DownloadResult> {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        logger.warn('Storage get URL error', { error: error.message });
        return { success: false, error: error.message };
      }

      // The SDK returns signedUrl - ensure it's a full URL
      let fullUrl = data.signedUrl;
      
      // Check if it's a relative URL (starts with / but not //)
      if (fullUrl && fullUrl.startsWith('/') && !fullUrl.startsWith('//')) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (supabaseUrl) {
          fullUrl = `${supabaseUrl}/storage/v1${fullUrl}`;
        }
      }
      
      // Double-check we have a valid URL
      if (!fullUrl || (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://'))) {
        logger.warn('Invalid URL generated', { url: fullUrl });
        return { success: false, error: 'URL invalide générée' };
      }

      return { success: true, url: fullUrl };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get URL';
      logger.logError('Storage URL error', err);
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Supprime un document
   */
  async deleteDocument(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        logger.warn('Storage delete error', { error: error.message });
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      logger.logError('Storage delete error', err);
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Liste les documents d'un utilisateur
   */
  async listUserDocuments(userId: string, folder?: string): Promise<{
    success: boolean;
    files?: Array<{ name: string; path: string; size: number; createdAt: string }>;
    error?: string;
  }> {
    try {
      const path = folder ? `${userId}/${folder}` : userId;
      
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(path, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        logger.warn('Storage list error', { error: error.message });
        return { success: false, error: error.message };
      }

      const files = data
        .filter(item => item.name !== '.emptyFolderPlaceholder')
        .map(item => ({
          name: item.name,
          path: `${path}/${item.name}`,
          size: item.metadata?.size || 0,
          createdAt: item.created_at,
        }));

      return { success: true, files };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'List failed';
      logger.logError('Storage list error', err);
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Télécharge un fichier directement (Blob)
   */
  async downloadDocument(filePath: string): Promise<{
    success: boolean;
    blob?: Blob;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(filePath);

      if (error) {
        logger.warn('Storage download error', { error: error.message });
        return { success: false, error: error.message };
      }

      return { success: true, blob: data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed';
      logger.logError('Storage download error', err);
      return { success: false, error: errorMessage };
    }
  },
};

export default storageService;
