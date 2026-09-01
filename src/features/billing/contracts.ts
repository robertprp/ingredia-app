export type SubscriptionProvider = 'STRIPE' | 'APPLE' | 'GOOGLE_PLAY';
export type SubscriptionStatus = 'FREE' | 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';

export interface BillingEligibility {
  policyVersion: string;
  purchaseAllowed: boolean;
  purchaseProvider: SubscriptionProvider | null;
  purchaseAction: 'NONE' | 'STRIPE_CHECKOUT' | 'APP_STORE_PURCHASE' | 'GOOGLE_PLAY_PURCHASE';
  restoreAction: 'NONE' | 'APP_STORE_RESTORE' | 'GOOGLE_PLAY_RESTORE';
  managementAction: 'NONE' | 'STRIPE_PORTAL' | 'APP_STORE_SUBSCRIPTIONS' | 'GOOGLE_PLAY_SUBSCRIPTIONS' | 'CONTACT_SUPPORT';
  reason: 'ELIGIBLE' | 'CHANNEL_MISMATCH' | 'EXISTING_SUBSCRIPTION';
}

export interface BillingPlan {
  id: string;
  name: string;
  localizedPrice: string | null;
  billingPeriod: 'MONTHLY' | 'YEARLY';
  trialDays: number;
  capabilities: string[];
  purchasable: boolean;
  providerReferences: { provider: SubscriptionProvider; productId: string }[];
}

export interface UserSubscription {
  status: SubscriptionStatus;
  provider: SubscriptionProvider | null;
  planId: string | null;
  renewsAt: string | null;
  currentPeriodEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface IngrediaEntitlements {
  scansRemaining: number | null;
  unlimitedScans: boolean;
  productComparison: boolean;
  personalizedPregnancyMode: boolean;
  completeHistory: boolean;
  monthlyScansRemaining: number | null;
}
