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
