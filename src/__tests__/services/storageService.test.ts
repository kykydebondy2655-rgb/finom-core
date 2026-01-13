/**
 * Unit Tests for Storage Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { storageService } from '@/services/storageService';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: vi.fn(),
    },
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  default: {
    warn: vi.fn(),
    logError: vi.fn(),
  },
}));

describe('storageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadDocument', () => {
    it('uploads a file successfully', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const mockPath = 'user-123/1234567890_test.pdf';

      const mockStorageBucket = {
        upload: vi.fn().mockResolvedValue({ data: { path: mockPath }, error: null }),
        createSignedUrl: vi.fn().mockResolvedValue({ 
          data: { signedUrl: 'https://example.com/signed-url' }, 
          error: null 
        }),
      };
      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageBucket as any);

      const result = await storageService.uploadDocument('user-123', mockFile);

      expect(result.success).toBe(true);
      expect(result.path).toBe(mockPath);
      expect(result.url).toBe('https://example.com/signed-url');
    });

    it('includes loanId and category in path when provided', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      
      const mockStorageBucket = {
        upload: vi.fn().mockResolvedValue({ data: { path: 'user/loan/cat/file' }, error: null }),
        createSignedUrl: vi.fn().mockResolvedValue({ 
          data: { signedUrl: 'https://example.com/url' }, 
          error: null 
        }),
      };
      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageBucket as any);

      await storageService.uploadDocument('user-123', mockFile, 'loan-456', 'identity');

      expect(mockStorageBucket.upload).toHaveBeenCalled();
      const uploadPath = mockStorageBucket.upload.mock.calls[0][0];
      expect(uploadPath).toContain('user-123');
      expect(uploadPath).toContain('loan-456');
      expect(uploadPath).toContain('identity');
    });

    it('sanitizes filename for special characters', async () => {
      const mockFile = new File(['content'], 'test file@#$.pdf', { type: 'application/pdf' });
      
      const mockStorageBucket = {
        upload: vi.fn().mockResolvedValue({ data: { path: 'path' }, error: null }),
        createSignedUrl: vi.fn().mockResolvedValue({ 
          data: { signedUrl: 'https://url' }, 
          error: null 
        }),
      };
      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageBucket as any);

      await storageService.uploadDocument('user-123', mockFile);

      const uploadPath = mockStorageBucket.upload.mock.calls[0][0];
      expect(uploadPath).not.toContain('@');
      expect(uploadPath).not.toContain('#');
      expect(uploadPath).not.toContain('$');
      expect(uploadPath).toContain('test_file___.pdf');
    });

    it('returns error on upload failure', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      
      const mockStorageBucket = {
        upload: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Upload failed' } 
        }),
      };
      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageBucket as any);

      const result = await storageService.uploadDocument('user-123', mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Upload failed');
    });

    it('handles exception during upload', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      
      const mockStorageBucket = {
        upload: vi.fn().mockRejectedValue(new Error('Network error')),
      };
      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageBucket as any);

      const result = await storageService.uploadDocument('user-123', mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('getDocumentUrl', () => {
    it('returns signed URL successfully', async () => {
      const mockStorageBucket = {
        createSignedUrl: vi.fn().mockResolvedValue({ 
          data: { signedUrl: 'https://example.com/signed' }, 
          error: null 
        }),
      };
      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageBucket as any);

      const result = await storageService.getDocumentUrl('/path/to/file.pdf');

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://example.com/signed');
    });

    it('uses custom expiration time', async () => {
      const mockStorageBucket = {
        createSignedUrl: vi.fn().mockResolvedValue({ 
          data: { signedUrl: 'https://example.com/signed' }, 
          error: null 
        }),
      };
      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageBucket as any);

      await storageService.getDocumentUrl('/path/to/file.pdf', 7200);

      expect(mockStorageBucket.createSignedUrl).toHaveBeenCalledWith('/path/to/file.pdf', 7200);
    });

    it('returns error on failure', async () => {
      const mockStorageBucket = {
        createSignedUrl: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Access denied' } 
        }),
      };
      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageBucket as any);

      const result = await storageService.getDocumentUrl('/path/to/file.pdf');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Access denied');
    });

    it('returns error for invalid URL format', async () => {
      const mockStorageBucket = {
        createSignedUrl: vi.fn().mockResolvedValue({ 
          data: { signedUrl: '' }, 
          error: null 
        }),
      };
      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageBucket as any);

      const result = await storageService.getDocumentUrl('/path/to/file.pdf');

      expect(result.success).toBe(false);
      expect(result.error).toBe('URL invalide générée');
    });
  });

  describe('deleteDocument', () => {
    it('deletes document successfully', async () => {
      const mockStorageBucket = {
        remove: vi.fn().mockResolvedValue({ error: null }),
      };
      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageBucket as any);

      const result = await storageService.deleteDocument('/path/to/file.pdf');

      expect(result.success).toBe(true);
      expect(mockStorageBucket.remove).toHaveBeenCalledWith(['/path/to/file.pdf']);
    });

    it('returns error on deletion failure', async () => {
      const mockStorageBucket = {
        remove: vi.fn().mockResolvedValue({ error: { message: 'Not found' } }),
      };
      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageBucket as any);

      const result = await storageService.deleteDocument('/path/to/file.pdf');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
    });
  });

  describe('listUserDocuments', () => {
    it('lists documents for user', async () => {
      const mockFiles = [
        { name: 'doc1.pdf', metadata: { size: 1024 }, created_at: '2024-01-01' },
        { name: 'doc2.pdf', metadata: { size: 2048 }, created_at: '2024-01-02' },
      ];

      const mockStorageBucket = {
        list: vi.fn().mockResolvedValue({ data: mockFiles, error: null }),
      };
      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageBucket as any);

      const result = await storageService.listUserDocuments('user-123');

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(2);
      expect(result.files?.[0].name).toBe('doc1.pdf');
    });

    it('includes folder in path when provided', async () => {
      const mockStorageBucket = {
        list: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageBucket as any);

      await storageService.listUserDocuments('user-123', 'identity');

      expect(mockStorageBucket.list).toHaveBeenCalledWith('user-123/identity', expect.any(Object));
    });

    it('filters out empty folder placeholders', async () => {
      const mockFiles = [
        { name: '.emptyFolderPlaceholder', metadata: {}, created_at: '2024-01-01' },
        { name: 'doc.pdf', metadata: { size: 1024 }, created_at: '2024-01-01' },
      ];

      const mockStorageBucket = {
        list: vi.fn().mockResolvedValue({ data: mockFiles, error: null }),
      };
      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageBucket as any);

      const result = await storageService.listUserDocuments('user-123');

      expect(result.files).toHaveLength(1);
      expect(result.files?.[0].name).toBe('doc.pdf');
    });

    it('returns error on failure', async () => {
      const mockStorageBucket = {
        list: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Permission denied' } 
        }),
      };
      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageBucket as any);

      const result = await storageService.listUserDocuments('user-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied');
    });
  });

  describe('downloadDocument', () => {
    it('downloads document as blob', async () => {
      const mockBlob = new Blob(['content'], { type: 'application/pdf' });

      const mockStorageBucket = {
        download: vi.fn().mockResolvedValue({ data: mockBlob, error: null }),
      };
      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageBucket as any);

      const result = await storageService.downloadDocument('/path/to/file.pdf');

      expect(result.success).toBe(true);
      expect(result.blob).toBe(mockBlob);
    });

    it('returns error on download failure', async () => {
      const mockStorageBucket = {
        download: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'File not found' } 
        }),
      };
      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageBucket as any);

      const result = await storageService.downloadDocument('/path/to/file.pdf');

      expect(result.success).toBe(false);
      expect(result.error).toBe('File not found');
    });
  });
});
