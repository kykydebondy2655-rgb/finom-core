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
    </div>
  );
};

export default CoborrowerDocumentUpload;