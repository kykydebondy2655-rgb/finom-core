import React, { useState } from 'react';
import DocumentUpload from './DocumentUpload';

interface CoborrowerDocumentUploadProps {
  loanId: string | undefined;
  hasCoborrower: boolean;
  onUploadComplete: () => void;
  onError: (error: string) => void;
}

const CoborrowerDocumentUpload: React.FC<CoborrowerDocumentUploadProps> = ({
  loanId,
  hasCoborrower,
  onUploadComplete,
  onError
}) => {
  const [activeOwner, setActiveOwner] = useState<'primary' | 'co_borrower'>('primary');

  if (!hasCoborrower) {
    return (
      <DocumentUpload
        loanId={loanId}
        category="loan_document"
        onUploadComplete={onUploadComplete}
        onError={onError}
      />
    );
  }

  return (
    <div className="coborrower-document-upload">
      <div className="owner-tabs">
        <button 
          className={`owner-tab ${activeOwner === 'primary' ? 'active' : ''}`}
          onClick={() => setActiveOwner('primary')}
        >
          👤 Emprunteur principal
        </button>
        <button 
          className={`owner-tab ${activeOwner === 'co_borrower' ? 'active' : ''}`}
          onClick={() => setActiveOwner('co_borrower')}
        >
          👥 Co-emprunteur
        </button>
      </div>

      <div className="upload-section">
        <p className="upload-hint">
          {activeOwner === 'primary' 
            ? 'Téléversez les documents de l\'emprunteur principal'
            : 'Téléversez les documents du co-emprunteur'}
        </p>
        <DocumentUpload
          loanId={loanId}
          category="loan_document"
          documentOwner={activeOwner}
          onUploadComplete={onUploadComplete}
          onError={onError}
        />
      </div>

      <style>{`
        .coborrower-document-upload { }
        
        .owner-tabs { 
          display: flex; 
          gap: 0.5rem; 
          margin-bottom: 1rem; 
          border-bottom: 2px solid var(--color-border);
          padding-bottom: 0;
        }
        
        .owner-tab { 
          padding: 0.75rem 1.25rem; 
          border: none; 
          background: transparent; 
          cursor: pointer; 
          font-size: 0.95rem; 
          font-weight: 500;
          color: var(--color-text-secondary);
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: all 0.2s;
        }
        .owner-tab:hover { color: var(--color-text); }
        .owner-tab.active { 
          color: var(--color-primary); 
          border-bottom-color: var(--color-primary); 
        }
        
        .upload-hint { 
          color: var(--color-text-secondary); 
          font-size: 0.9rem; 
          margin-bottom: 1rem; 
        }
      `}</style>
    </div>
  );
};

export default CoborrowerDocumentUpload;