import type { AdditiveDetails, AdditiveSummary } from '@/features/additives/contracts';
import type { BillingEligibility, IngrediaEntitlements } from '@/features/billing/contracts';
import type { OperationResult } from '@/features/common/operation-result';

export interface ApiFailure {
  code: 'NETWORK' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'NOT_IMPLEMENTED';
  message: string;
  retryable: boolean;
}

export interface IngrediaApi {
  listAdditives(search: string): Promise<OperationResult<readonly AdditiveSummary[], ApiFailure>>;
  getAdditive(code: string): Promise<OperationResult<AdditiveDetails, ApiFailure>>;
  getEntitlements(): Promise<OperationResult<IngrediaEntitlements, ApiFailure>>;
  getBillingEligibility(): Promise<OperationResult<BillingEligibility, ApiFailure>>;
}

// The API currently exposes authentication and verification only. Feature implementations
// will be generated from the backend contract when Ingredia endpoints are available.
export const apiAvailability = {
  additives: false,
  analyses: false,
  billing: false,
} as const;
