export const CLIENT_STATUS_VALUES = [
  'nouveau',
  'nrp',
  'faux_numero',
  'pas_interesse',
  'a_rappeler',
  'interesse',
  'qualifie',
  'converti',
] as const;

export type ClientStatusValue = (typeof CLIENT_STATUS_VALUES)[number];

const STATUS_SET = new Set<string>(CLIENT_STATUS_VALUES);

/**
 * Normalise un statut client (pipeline_stage) vers une valeur connue.
 * - null/empty => "nouveau"
 * - accents/espaces/tirets => snake_case
 * - variations FR => forme canonique
 * - toute valeur inconnue => "nouveau" (pour éviter les statuts “fantômes”)
 */
export const normalizeClientStatus = (raw: string | null | undefined): ClientStatusValue => {
  if (!raw) return 'nouveau';
  const v = raw.trim();
  if (!v) return 'nouveau';

  const lower = v.toLowerCase();
  const normalized = lower.replace(/\s+/g, '_').replace(/-/g, '_');

  if (normalized === 'faux_numéro' || normalized === 'faux_numero') return 'faux_numero';
  if (normalized === 'à_rappeler' || normalized === 'a_rappeler') return 'a_rappeler';
  if (normalized === 'pas_intéressé' || normalized === 'pas_interessé') return 'pas_interesse';
  if (normalized === 'nrp') return 'nrp';
  if (normalized === 'nouveau' || normalized === 'nouveaux') return 'nouveau';

  // Si le pipeline_stage contient autre chose (ex: phrase du formulaire), on le traite comme "nouveau"
  // afin que le raccourci "Nouveau" les affiche.
  if (!STATUS_SET.has(normalized)) return 'nouveau';

  return normalized as ClientStatusValue;
};
