import { Platform } from 'react-native';

import { File as ExpoFile } from "expo-file-system"
import { fetch as expoFetch } from "expo/fetch"

import type {
  AdditiveDetails,
  AdditivePage,
  AdditiveSummary,
  PregnancyStatus,
  ToxicityLevel,
} from '@/features/additives/contracts';
import { guidanceFromPregnancy, riskFromToxicity } from '@/features/additives/contracts';
import type {
  AnalysisPage,
  ProductAnalysis,
  ProductComparison,
  ScanResponse,
  ScanUpload,
} from '@/features/analyses/contracts';
import type {
  BillingEligibility,
  BillingPlan,
  IngrediaEntitlements,
  SubscriptionProvider,
  UserSubscription,
} from '@/features/billing/contracts';
import type { AccountDeletionResponse, UserPreferences } from '@/features/preferences/contracts';
import { mobileConfig } from '@/config/mobile-config';
import { authClient } from '@/lib/auth-client';

interface ApiErrorBody {
  code?: string;
  message?: string;
  requestId?: string;
}

export class IngrediaApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code = 'UNKNOWN',
    readonly requestId?: string,
  ) {
    super(message);
  }
}

function apiUrl(path: string, query?: Record<string, string | number | undefined>): string {
  const target = new URL(`${mobileConfig.apiUrl.replace(/\/$/, '')}${path}`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') target.searchParams.set(key, String(value));
  });
  return target.toString();
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  query?: Record<string, string | number | undefined>,
): Promise<T> {
  const headers = new Headers(init.headers);
  const isFormData =
    typeof FormData !== 'undefined' &&
    init.body instanceof FormData;

  if (Platform.OS !== 'web') {
    const cookie = await authClient.getCookie();

    if (cookie) {
      headers.set('cookie', cookie);
    }

    headers.set('expo-origin', 'ingredia://');
  }

  headers.set('accept', 'application/json');

  if (isFormData) {
    // Do not set this manually. fetch must generate the multipart boundary.
    headers.delete('content-type');
  } else if (init.body != null && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const url = apiUrl(path, query);

  let response: Response;

  try {
    console.log(url);

    // Use React Native's/global fetch, not fetch imported from expo/fetch.
    response = await fetch(url, {
      ...init,
      headers,
      credentials: Platform.OS === 'web' ? 'include' : 'omit',
    });
  } catch (error) {
    console.log('Request network error:', error);

    throw new IngrediaApiError(
      'No se pudo conectar con Ingredia. Comprueba tu conexión.',
      0,
      'NETWORK',
    );
  }

  if (!response.ok) {
    let body: ApiErrorBody = {};

    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      // The server may return plain text or an empty response.
      body = {};
    }

    throw new IngrediaApiError(
      body.message ?? 'No se pudo completar la operación.',
      response.status,
      body.code,
      body.requestId,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

type RawAdditive = {
  code: string;
  name: string;
  category: string;
  toxicityLevel: ToxicityLevel;
  pregnancyStatus: PregnancyStatus;
};

function mapAdditive(item: RawAdditive): AdditiveSummary {
  return {
    code: item.code,
    name: item.name,
    category: item.category,
    riskLevel: riskFromToxicity(item.toxicityLevel),
    pregnancyGuidance: guidanceFromPregnancy(item.pregnancyStatus),
  };
}

export const ingrediaApi = {
  async listAdditives(search = ''): Promise<AdditivePage> {
    const page = await request<{ items: RawAdditive[]; nextCursor: string | null; hasMore: boolean }>(
      '/api/v1/additives',
      {},
      { q: search.trim() || undefined, limit: 100 },
    );
    return { ...page, items: page.items.map(mapAdditive) };
  },

  async getAdditive(code: string): Promise<AdditiveDetails> {
    const item = await request<
      RawAdditive & {
        alternativeNames: string[];
        description: string;
        foodIndustryUses: string;
        healthImpact: string;
        lowDoseEffects: string | null;
        highDoseEffects: string | null;
        pregnancy: { status: PregnancyStatus; reason: string };
        lastReviewedAt: string;
      }
    >(`/api/v1/additives/${encodeURIComponent(code)}`);
    return {
      ...mapAdditive(item),
      description: item.description,
      uses: item.foodIndustryUses,
      healthImpact: item.healthImpact,
      lowDoseEffects: item.lowDoseEffects ?? 'No hay datos específicos disponibles.',
      highDoseEffects: item.highDoseEffects ?? 'No hay datos específicos disponibles.',
      pregnancyNotes: item.pregnancy.reason,
      sources: item.alternativeNames,
      lastReviewedAt: item.lastReviewedAt,
    };
  },
  
  async createScan(
    image: ScanUpload,
    productName?: string,
  ): Promise<ScanResponse> {
    const form = new FormData();
  
    if (Platform.OS === 'web') {
      if (!image.file) {
        throw new Error('The selected image does not contain a web File.');
      }
  
      form.append(
        'image',
        image.file,
        image.fileName?.trim() || image.file.name || 'scan.jpg',
      );
    } else {
      form.append("image",new ExpoFile(image.uri));
    }

    if (productName?.trim()) {
      form.append('productName', productName.trim());
    }

    const url = apiUrl('/api/v1/scans');

    const headers = new Headers();

    if (Platform.OS !== 'web') {
      const cookie = await authClient.getCookie();
  
      if (cookie) {
        headers.set('cookie', cookie);
      }
  
      headers.set('expo-origin', 'ingredia://');
    }
  
    headers.set('accept', 'application/json');

    const response = await expoFetch(url, {
      method: 'POST',
      body: form,
      headers
    });

    const resp = (await response.json()) as ScanResponse;
    console.log({ resp })
    
    return resp
  },
  getScan: (scanId: string) => request<ScanResponse>(`/api/v1/scans/${encodeURIComponent(scanId)}`),
  listAnalyses: (filter: 'RECENT' | 'SAVED' = 'RECENT') =>
    request<AnalysisPage>('/api/v1/analyses', {}, { filter, limit: 100 }),
  getAnalysis: (analysisId: string) =>
    request<ProductAnalysis>(`/api/v1/analyses/${encodeURIComponent(analysisId)}`),
  setAnalysisSaved: (analysisId: string, saved: boolean) =>
    request<{ analysisId: string; saved: boolean }>(
      `/api/v1/analyses/${encodeURIComponent(analysisId)}/saved`,
      { method: 'PATCH', body: JSON.stringify({ saved }) },
    ),
  deleteAnalysis: (analysisId: string) =>
    request<void>(`/api/v1/analyses/${encodeURIComponent(analysisId)}`, { method: 'DELETE' }),
  compareAnalyses: (analysisIds: [string, string]) =>
    request<ProductComparison>('/api/v1/comparisons', {
      method: 'POST',
      body: JSON.stringify({ analysisIds }),
    }),

  getPreferences: () => request<UserPreferences>('/api/v1/me/preferences'),
  updatePreferences: (changes: Partial<UserPreferences>) =>
    request<UserPreferences>('/api/v1/me/preferences', {
      method: 'PATCH',
      body: JSON.stringify(changes),
    }),
  getEntitlements: () => request<IngrediaEntitlements>('/api/v1/me/entitlements'),
  requestAccountDeletion: () =>
    request<AccountDeletionResponse>('/api/v1/me/account-deletion', {
      method: 'POST',
      body: JSON.stringify({ confirmation: 'DELETE' }),
    }),

  getBillingEligibility: () =>
    request<BillingEligibility>('/api/v1/billing/eligibility', {}, {
      platform: Platform.OS === 'ios' ? 'IOS' : Platform.OS === 'android' ? 'ANDROID' : 'WEB',
      distributionChannel:
        Platform.OS === 'ios' ? 'APP_STORE' : Platform.OS === 'android' ? 'GOOGLE_PLAY' : 'WEB_DIRECT',
    }),
  getBillingPlans: async () =>
    (await request<{ plans: BillingPlan[] }>('/api/v1/billing/plans')).plans,
  getSubscription: () => request<UserSubscription>('/api/v1/billing/subscription'),
  createStripeSubscription: (planId: string, successUrl: string, cancelUrl: string) =>
    request<{ url: string }>('/api/v1/billing/stripe/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ planId, successUrl, cancelUrl }),
    }),
  verifyMobilePurchase: (
    provider: Extract<SubscriptionProvider, 'APPLE' | 'GOOGLE_PLAY'>,
    planId: string,
    transactionToken: string,
  ) =>
    request<UserSubscription>('/api/v1/billing/mobile-purchases/verify', {
      method: 'POST',
      body: JSON.stringify({ provider, planId, transactionToken }),
    }),
  restorePurchases: (provider: Extract<SubscriptionProvider, 'APPLE' | 'GOOGLE_PLAY'>) =>
    request<UserSubscription>('/api/v1/billing/restore', {
      method: 'POST',
      body: JSON.stringify({ provider }),
    }),
};

export function apiErrorMessage(error: Error | string | null | undefined): string {
  return error instanceof Error ? error.message : typeof error === 'string' ? error : 'Ha ocurrido un error inesperado.';
}
