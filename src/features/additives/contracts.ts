export enum ProductRiskLevel {
  LOW = 'LOW',
  CAUTION = 'CAUTION',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
  INSUFFICIENT_EVIDENCE = 'INSUFFICIENT_EVIDENCE',
}

export enum PregnancyGuidance {
  SUITABLE = 'SUITABLE',
  CAUTION = 'CAUTION',
  AVOID = 'AVOID',
  INSUFFICIENT_EVIDENCE = 'INSUFFICIENT_EVIDENCE',
}

export enum ToxicityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

export type PregnancyStatus = 'SUITABLE' | 'CAUTION' | 'NOT_SUITABLE' | 'INSUFFICIENT_EVIDENCE';

export interface AdditiveSummary {
  code: string;
  name: string;
  category: string;
  riskLevel: ProductRiskLevel;
  pregnancyGuidance: PregnancyGuidance;
}

export interface AdditiveDetails extends AdditiveSummary {
  description: string;
  uses: string;
  healthImpact: string;
  lowDoseEffects: string;
  highDoseEffects: string;
  pregnancyNotes: string;
  sources: readonly string[];
  lastReviewedAt: string;
}

export interface AdditivePage {
  items: AdditiveSummary[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function riskFromToxicity(level: ToxicityLevel): ProductRiskLevel {
  return level === ToxicityLevel.MEDIUM ? ProductRiskLevel.CAUTION : ProductRiskLevel[level];
}

export function guidanceFromPregnancy(status: PregnancyStatus): PregnancyGuidance {
  if (status === 'NOT_SUITABLE') return PregnancyGuidance.AVOID;
  return PregnancyGuidance[status];
}
