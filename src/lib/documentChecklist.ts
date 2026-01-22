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

// Individual project types
export const PROJECT_TYPES_PARTICULIER = {
  achat_residence_principale: 'Achat résidence principale',
  achat_residence_secondaire: 'Achat résidence secondaire',
  investissement_locatif: 'Investissement locatif',
  construction: 'Construction',
  renovation: 'Rénovation',
} as const;

// Business project types
export const PROJECT_TYPES_ENTREPRISE = {
  achat_locaux_commerciaux: 'Achat locaux commerciaux',
  investissement_locatif_pro: 'Investissement locatif professionnel',
  construction_pro: 'Construction professionnelle',
  renovation_pro: 'Rénovation professionnelle',
} as const;

// Combined project types
export const PROJECT_TYPES = {
  ...PROJECT_TYPES_PARTICULIER,
  ...PROJECT_TYPES_ENTREPRISE,
} as const;

export type ProjectType = keyof typeof PROJECT_TYPES;

// Base documents required for individual (particulier) loans
const BASE_DOCUMENTS_PARTICULIER: DocumentRequirement[] = [
  { id: 'id_card', name: 'Pièce d\'identité', description: 'CNI, passeport ou titre de séjour en cours de validité', required: true, category: 'identite' },
  { id: 'proof_of_address', name: 'Justificatif de domicile', description: 'Facture de moins de 3 mois (électricité, gaz, téléphone)', required: true, category: 'identite' },
  { id: 'tax_notice', name: 'Avis d\'imposition', description: 'Les 2 derniers avis d\'imposition', required: true, category: 'fiscal' },
  { id: 'payslips', name: 'Bulletins de salaire', description: '3 derniers bulletins de salaire', required: true, category: 'revenus' },
  { id: 'employment_contract', name: 'Contrat de travail', description: 'Ou attestation employeur', required: true, category: 'revenus' },
  { id: 'bank_statements', name: 'Relevés bancaires', description: '3 derniers mois de relevés de compte', required: true, category: 'bancaire' },
];

// Base documents required for business (entreprise) loans
const BASE_DOCUMENTS_ENTREPRISE: DocumentRequirement[] = [
  { id: 'kbis', name: 'Extrait Kbis', description: 'Kbis de moins de 3 mois', required: true, category: 'entreprise' },
  { id: 'statuts', name: 'Statuts de la société', description: 'Statuts à jour et signés', required: true, category: 'entreprise' },
  { id: 'bilans', name: 'Bilans comptables', description: 'Les 3 derniers bilans certifiés', required: true, category: 'fiscal' },
  { id: 'liasses_fiscales', name: 'Liasses fiscales', description: 'Les 3 dernières liasses fiscales', required: true, category: 'fiscal' },
  { id: 'id_card_dirigeant', name: 'Pièce d\'identité dirigeant', description: 'CNI ou passeport du gérant/président', required: true, category: 'identite' },
  { id: 'bank_statements_pro', name: 'Relevés bancaires professionnels', description: '6 derniers mois de relevés de compte professionnel', required: true, category: 'bancaire' },
];

// Additional documents per project type (particulier)
const PROJECT_SPECIFIC_DOCUMENTS_PARTICULIER: Record<string, DocumentRequirement[]> = {
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

// Additional documents per project type (entreprise)
const PROJECT_SPECIFIC_DOCUMENTS_ENTREPRISE: Record<string, DocumentRequirement[]> = {
  achat_locaux_commerciaux: [
    { id: 'compromise_pro', name: 'Compromis de vente', description: 'Signé par les deux parties (société)', required: true, category: 'bien' },
    { id: 'property_diagnostics_pro', name: 'Diagnostics immobiliers', description: 'DPE, amiante, accessibilité...', required: true, category: 'bien' },
    { id: 'bail_commercial', name: 'Bail commercial existant', description: 'Si le bien est déjà loué', required: false, category: 'bien' },
  ],
  investissement_locatif_pro: [
    { id: 'compromise_pro', name: 'Compromis de vente', description: 'Signé par les deux parties (société)', required: true, category: 'bien' },
    { id: 'property_diagnostics_pro', name: 'Diagnostics immobiliers', description: 'DPE, amiante, plomb...', required: true, category: 'bien' },
    { id: 'rental_estimation_pro', name: 'Estimation locative', description: 'Évaluation du loyer professionnel potentiel', required: true, category: 'bien' },
    { id: 'existing_baux_pro', name: 'Baux commerciaux existants', description: 'Si autres biens en location', required: false, category: 'revenus' },
  ],
  construction_pro: [
    { id: 'land_compromise_pro', name: 'Compromis terrain', description: 'Ou acte de propriété du terrain', required: true, category: 'bien' },
    { id: 'building_permit_pro', name: 'Permis de construire', description: 'Permis de construire professionnel', required: true, category: 'bien' },
    { id: 'construction_contract_pro', name: 'Contrat de construction', description: 'Contrat avec constructeur/architecte', required: true, category: 'bien' },
    { id: 'construction_plans_pro', name: 'Plans des locaux', description: 'Plans et descriptif technique', required: true, category: 'bien' },
    { id: 'insurance_dommage_pro', name: 'Assurance dommages-ouvrage', description: 'Attestation d\'assurance professionnelle', required: true, category: 'assurance' },
  ],
  renovation_pro: [
    { id: 'property_title_pro', name: 'Titre de propriété', description: 'Acte de propriété du bien professionnel', required: true, category: 'bien' },
    { id: 'renovation_quotes_pro', name: 'Devis travaux', description: 'Devis détaillés des artisans/entreprises', required: true, category: 'bien' },
    { id: 'renovation_plans_pro', name: 'Plans / descriptif', description: 'Description des travaux prévus', required: false, category: 'bien' },
  ],
};

// Combined project specific documents
const PROJECT_SPECIFIC_DOCUMENTS: Record<ProjectType, DocumentRequirement[]> = {
  ...PROJECT_SPECIFIC_DOCUMENTS_PARTICULIER,
  ...PROJECT_SPECIFIC_DOCUMENTS_ENTREPRISE,
} as Record<ProjectType, DocumentRequirement[]>;

/**
 * Check if a project type is for business
 */
export const isBusinessProjectType = (projectType: string): boolean => {
  return projectType in PROJECT_TYPES_ENTREPRISE;
};

/**
 * Get all required documents for a specific project type
 */
export const getDocumentChecklist = (projectType: ProjectType): DocumentRequirement[] => {
  const isEntreprise = isBusinessProjectType(projectType);
  const baseDocuments = isEntreprise ? BASE_DOCUMENTS_ENTREPRISE : BASE_DOCUMENTS_PARTICULIER;
  const specificDocs = PROJECT_SPECIFIC_DOCUMENTS[projectType] || [];
  return [...baseDocuments, ...specificDocs];
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
  entreprise: { label: 'Entreprise', icon: 'Building2' },
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
