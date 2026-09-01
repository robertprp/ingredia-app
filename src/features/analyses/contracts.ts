import type { PregnancyStatus, ProductRiskLevel, ToxicityLevel } from '@/features/additives/contracts';

export type ScanStatus = 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'NEEDS_REVIEW' | 'FAILED';

export interface ScanUpload {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  file?: File;
}

export interface ScanResponse {
  id: string;
  status: ScanStatus;
  createdAt?: string;
  productName?: string | null;
  ingredientsText?: string | null;
  ocrConfidence?: number | null;
  analysisId?: string | null;
  failure?: { code: string; message: string; retryable: boolean } | null;
}

export interface AnalysisListItem {
  id: string;
  productName: string;
  additiveCount: number;
  riskLevel: ProductRiskLevel;
  saved: boolean;
  createdAt: string;
}

export interface AnalysisPage {
  items: AnalysisListItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface DetectedAdditive {
  code: string;
  name: string;
  toxicityLevel: ToxicityLevel;
  pregnancyStatus: PregnancyStatus;
  pregnancyReason: string;
}

export interface ProductAnalysis {
  id: string;
  productName: string;
  overallRisk: ProductRiskLevel;
  pregnancyRisk: PregnancyStatus;
  summary: string;
  detectedAdditives: DetectedAdditive[];
  unrecognizedIngredients: {
    originalText: string;
    normalizedText: string;
    reason: 'NOT_IN_CATALOG' | 'INVALID_E_NUMBER';
  }[];
  createdAt: string;
  disclaimer: string;
}

export interface ProductComparison {
  id: string;
  products: {
    analysisId: string;
    productName: string;
    additiveCount: number;
    maximumRisk: ProductRiskLevel;
    pregnancyStatus: PregnancyStatus;
  }[];
  recommendedAnalysisId: string | null;
  reason: string;
}
