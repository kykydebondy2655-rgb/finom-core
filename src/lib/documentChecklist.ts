/**
 * Document checklist configuration per loan project type
 */

export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: string;
}

export const PROJECT_TYPES = {
  achat_residence_principale: 'Achat résidence principale',
  achat_residence_secondaire: 'Achat résidence secondaire',
  investissement_locatif: 'Investissement locatif',
  construction: 'Construction',
  renovation: 'Rénovation',
} as const;

export type ProjectType = keyof typeof PROJECT_TYPES;

// Base documents required for all loan types
const BASE_DOCUMENTS: DocumentRequirement[] = [
  { id: 'id_card', name: 'Pièce d\'identité', description: 'CNI, passeport ou titre de séjour en cours de validité', required: true, category: 'identite' },
  { id: 'proof_of_address', name: 'Justificatif de domicile', description: 'Facture de moins de 3 mois (électricité, gaz, téléphone)', required: true, category: 'identite' },
  { id: 'tax_notice', name: 'Avis d\'imposition', description: 'Les 2 derniers avis d\'imposition', required: true, category: 'fiscal' },
  { id: 'payslips', name: 'Bulletins de salaire', description: '3 derniers bulletins de salaire', required: true, category: 'revenus' },
  { id: 'employment_contract', name: 'Contrat de travail', description: 'Ou attestation employeur', required: true, category: 'revenus' },
  { id: 'bank_statements', name: 'Relevés bancaires', description: '3 derniers mois de relevés de compte', required: true, category: 'bancaire' },
];

// Additional documents per project type
const PROJECT_SPECIFIC_DOCUMENTS: Record<ProjectType, DocumentRequirement[]> = {
  achat_residence_principale: [
    { id: 'compromise', name: 'Compromis de vente', description: 'Signé par les deux parties', required: true, category: 'bien' },
    { id: 'property_diagnostics', name: 'Diagnostics immobiliers', description: 'DPE, amiante, plomb...', required: true, category: 'bien' },
  ],
  achat_residence_secondaire: [
    { id: 'compromise', name: 'Compromis de vente', description: 'Signé par les deux parties', required: true, category: 'bien' },
    { id: 'property_diagnostics', name: 'Diagnostics immobiliers', description: 'DPE, amiante, plomb...', required: true, category: 'bien' },
    { id: 'primary_residence_proof', name: 'Justificatif résidence principale', description: 'Taxe foncière ou bail', required: true, category: 'bien' },
  ],
  investissement_locatif: [
    { id: 'compromise', name: 'Compromis de vente', description: 'Signé par les deux parties', required: true, category: 'bien' },
    { id: 'property_diagnostics', name: 'Diagnostics immobiliers', description: 'DPE, amiante, plomb...', required: true, category: 'bien' },
    { id: 'rental_estimation', name: 'Estimation locative', description: 'Évaluation du loyer potentiel', required: true, category: 'bien' },
    { id: 'existing_rentals', name: 'Baux existants', description: 'Si autres biens en location', required: false, category: 'revenus' },
  ],
  construction: [
    { id: 'land_compromise', name: 'Compromis terrain', description: 'Ou acte de propriété du terrain', required: true, category: 'bien' },
    { id: 'building_permit', name: 'Permis de construire', description: 'Ou demande de permis', required: true, category: 'bien' },
    { id: 'construction_contract', name: 'Contrat de construction', description: 'CCMI ou contrat architecte/artisans', required: true, category: 'bien' },
    { id: 'construction_plans', name: 'Plans de la maison', description: 'Plans et descriptif technique', required: true, category: 'bien' },
    { id: 'insurance_dommage', name: 'Assurance dommages-ouvrage', description: 'Attestation d\'assurance', required: true, category: 'assurance' },
  ],
  renovation: [
    { id: 'property_title', name: 'Titre de propriété', description: 'Acte de propriété du bien', required: true, category: 'bien' },
    { id: 'renovation_quotes', name: 'Devis travaux', description: 'Devis détaillés des artisans', required: true, category: 'bien' },
    { id: 'renovation_plans', name: 'Plans / descriptif', description: 'Description des travaux prévus', required: false, category: 'bien' },
  ],
};

/**
 * Get all required documents for a specific project type
 */
export const getDocumentChecklist = (projectType: ProjectType): DocumentRequirement[] => {
  const specificDocs = PROJECT_SPECIFIC_DOCUMENTS[projectType] || [];
  return [...BASE_DOCUMENTS, ...specificDocs];
};

/**
 * Get document categories
 */
export const DOCUMENT_CATEGORIES = {
  identite: { label: 'Identité', icon: 'IdCard' },
  fiscal: { label: 'Fiscal', icon: 'BarChart3' },
  revenus: { label: 'Revenus', icon: 'Coins' },
  bancaire: { label: 'Bancaire', icon: 'Landmark' },
  bien: { label: 'Bien immobilier', icon: 'Home' },
  assurance: { label: 'Assurance', icon: 'ShieldCheck' },
} as const;

/**
 * Calculate document completion progress
 */
export const calculateDocumentProgress = (
  checklist: DocumentRequirement[],
  uploadedDocuments: { category?: string | null }[]
): { completed: number; total: number; percentage: number } => {
  const requiredDocs = checklist.filter(doc => doc.required);
  const uploadedCategories = new Set(uploadedDocuments.map(d => d.category).filter(Boolean));
  
  // Simple match by checking if category contains document id patterns
  let completed = 0;
  requiredDocs.forEach(doc => {
    if (uploadedDocuments.some(uploaded => 
      uploaded.category?.toLowerCase().includes(doc.id.toLowerCase()) ||
      uploaded.category?.toLowerCase().includes(doc.category.toLowerCase())
    )) {
      completed++;
    }
  });

  return {
    completed,
    total: requiredDocs.length,
    percentage: requiredDocs.length > 0 ? Math.round((completed / requiredDocs.length) * 100) : 0,
  };
};
