/**
 * Storage Service - Gestion des documents via Supabase Storage
 */

import { supabase } from '@/integrations/supabase/client';

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
        console.error('Upload error:', error);
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
      console.error('Storage upload error:', errorMessage);
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
        console.error('Get URL error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, url: data.signedUrl };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get URL';
      console.error('Storage URL error:', errorMessage);
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
        console.error('Delete error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      console.error('Storage delete error:', errorMessage);
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
        console.error('List error:', error);
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
      console.error('Storage list error:', errorMessage);
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
        console.error('Download error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, blob: data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed';
      console.error('Storage download error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },
};

export default storageService;
