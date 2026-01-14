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
        {Object.entries(groupedDocs).map(([categoryKey, docs]) => {
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

      <style>{`
        .document-checklist { margin-bottom: 1.5rem; }
        .checklist-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem; }
        .checklist-header h3 { margin: 0; font-size: 1.25rem; }
        .progress-info { display: flex; align-items: center; gap: 0.75rem; }
        .progress-bar { width: 100px; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #10b981, #059669); transition: width 0.3s; }
        .progress-text { font-size: 0.85rem; color: #6b7280; font-weight: 500; white-space: nowrap; }
        
        .owner-tabs-container { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .owner-tabs { 
          display: flex; 
          gap: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0;
        }
        .owner-tab { 
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem; 
          border: none; 
          background: transparent; 
          cursor: pointer; 
          font-size: 0.9rem; 
          font-weight: 500;
          color: #6b7280;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: all 0.2s;
        }
        .owner-tab:hover { color: #374151; }
        .owner-tab.active { 
          color: var(--color-primary); 
          border-bottom-color: var(--color-primary); 
        }
        .tab-progress {
          font-size: 0.75rem;
          background: #f3f4f6;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          color: #6b7280;
        }
        .owner-tab.active .tab-progress {
          background: var(--color-primary);
          color: white;
        }
        
        .category-section { margin-bottom: 1.5rem; }
        .category-section:last-child { margin-bottom: 0; }
        .category-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem; color: #374151; }
        .category-icon { font-size: 1.1rem; }
        
        .documents-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .document-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s;
        }
        .document-item.status-pending { cursor: pointer; }
        .document-item.status-pending:hover { background: #f3f4f6; border-color: #d1d5db; }
        .document-item.status-validated { background: #ecfdf5; border-color: #a7f3d0; }
        .document-item.status-uploaded { background: #eff6ff; border-color: #bfdbfe; }
        .document-item.status-rejected { background: #fef2f2; border-color: #fecaca; }
        
        .doc-status-icon { font-size: 1.1rem; flex-shrink: 0; }
        .doc-info { flex: 1; }
        .doc-name { display: block; font-weight: 500; color: #374151; font-size: 0.95rem; }
        .required-badge { color: #ef4444; margin-left: 0.25rem; }
        .doc-description { display: block; font-size: 0.8rem; color: #6b7280; margin-top: 0.1rem; }
        
        .upload-btn {
          padding: 0.4rem 0.75rem;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        .upload-btn:hover { opacity: 0.9; }
        
        @media (max-width: 640px) {
          .owner-tabs-container { flex-direction: column; align-items: stretch; }
          .owner-tabs { overflow-x: auto; }
        }
      `}</style>
    </Card>
  );
};

export default DocumentChecklist;
