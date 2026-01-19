import React, { useState } from 'react';
import Card from '@/components/finom/Card';
import { getDocumentChecklist, DOCUMENT_CATEGORIES, calculateDocumentProgress, type ProjectType, type DocumentRequirement } from '@/lib/documentChecklist';
import type { Document } from '@/services/api';

interface DocumentChecklistProps {
  projectType: ProjectType;
  uploadedDocuments: Document[];
  hasCoborrower?: boolean;
  onUploadClick?: (documentId: string) => void;
}

// Documents that need to be provided by co-borrower as well
const COBORROWER_REQUIRED_DOCS = ['id_card', 'proof_of_address', 'tax_notice', 'payslips', 'employment_contract', 'bank_statements'];

const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  projectType,
  uploadedDocuments,
  hasCoborrower = false,
  onUploadClick,
}) => {
  const [activeOwner, setActiveOwner] = useState<'primary' | 'co_borrower'>('primary');
  
  const checklist = getDocumentChecklist(projectType);
  
  // Filter documents by owner
  const primaryDocs = uploadedDocuments.filter(d => !d.document_owner || d.document_owner === 'primary');
  const coborrowerDocs = uploadedDocuments.filter(d => d.document_owner === 'co_borrower');
  
  // For co-borrower, only show personal documents (identity, income, etc.)
  const coborrowerChecklist = checklist.filter(doc => COBORROWER_REQUIRED_DOCS.includes(doc.id));
  
  const currentChecklist = activeOwner === 'primary' ? checklist : coborrowerChecklist;
  const currentDocs = activeOwner === 'primary' ? primaryDocs : coborrowerDocs;
  
  const progress = calculateDocumentProgress(currentChecklist, currentDocs);
  const primaryProgress = calculateDocumentProgress(checklist, primaryDocs);
  const coborrowerProgress = calculateDocumentProgress(coborrowerChecklist, coborrowerDocs);
  
  // Group documents by category
  const groupedDocs = currentChecklist.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, DocumentRequirement[]>);

  const getDocumentStatus = (docId: string, category: string): 'uploaded' | 'pending' | 'validated' | 'rejected' => {
    const uploaded = currentDocs.find(d => 
      d.category?.toLowerCase().includes(docId.toLowerCase()) ||
      d.category?.toLowerCase().includes(category.toLowerCase())
    );
    if (!uploaded) return 'pending';
    if (uploaded.status === 'validated' || uploaded.status === 'approved') return 'validated';
    if (uploaded.status === 'rejected') return 'rejected';
    return 'uploaded';
  };

  return (
    <Card className="document-checklist" padding="lg">
      <div className="checklist-header">
        <h3>📋 Documents requis</h3>
        {!hasCoborrower && (
          <div className="progress-info">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <span className="progress-text">
              {progress.completed}/{progress.total} documents ({progress.percentage}%)
            </span>
          </div>
        )}
      </div>

      {/* Owner tabs when has coborrower */}
      {hasCoborrower && (
        <div className="owner-tabs-container">
          <div className="owner-tabs">
            <button 
              className={`owner-tab ${activeOwner === 'primary' ? 'active' : ''}`}
              onClick={() => setActiveOwner('primary')}
            >
              👤 Emprunteur principal
              <span className="tab-progress">{primaryProgress.completed}/{primaryProgress.total}</span>
            </button>
            <button 
              className={`owner-tab ${activeOwner === 'co_borrower' ? 'active' : ''}`}
              onClick={() => setActiveOwner('co_borrower')}
            >
              👥 Co-emprunteur
              <span className="tab-progress">{coborrowerProgress.completed}/{coborrowerProgress.total}</span>
            </button>
          </div>
          <div className="progress-info">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <span className="progress-text">
              {progress.completed}/{progress.total} ({progress.percentage}%)
            </span>
          </div>
        </div>
      )}

      <div className="categories-list">
        {Object.entries(groupedDocs).map(([categoryKey, docs]: [string, DocumentRequirement[]]) => {
          const category = DOCUMENT_CATEGORIES[categoryKey as keyof typeof DOCUMENT_CATEGORIES];
          return (
            <div key={categoryKey} className="category-section">
              <h4 className="category-title">
                <span className="category-icon">{category?.icon || '📄'}</span>
                {category?.label || categoryKey}
              </h4>
              <div className="documents-list">
                {docs.map(doc => {
                  const status = getDocumentStatus(doc.id, doc.category);
                  return (
                    <div 
                      key={doc.id} 
                      className={`document-item status-${status}`}
                      onClick={() => status === 'pending' && onUploadClick?.(doc.id)}
                    >
                      <div className="doc-status-icon">
                        {status === 'validated' && '✅'}
                        {status === 'uploaded' && '📤'}
                        {status === 'rejected' && '❌'}
                        {status === 'pending' && (doc.required ? '⭕' : '⚪')}
                      </div>
                      <div className="doc-info">
                        <span className="doc-name">
                          {doc.name}
                          {doc.required && <span className="required-badge">*</span>}
                        </span>
                        <span className="doc-description">{doc.description}</span>
                      </div>
                      {status === 'pending' && onUploadClick && (
                        <button className="upload-btn" onClick={(e) => { e.stopPropagation(); onUploadClick(doc.id); }}>
                          Ajouter
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </Card>
  );
};

export default DocumentChecklist;
