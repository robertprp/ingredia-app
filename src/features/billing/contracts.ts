export enum BillingChannel {
  STRIPE = 'STRIPE',
  APP_STORE = 'APP_STORE',
  GOOGLE_PLAY = 'GOOGLE_PLAY',
  EXTERNAL_WEB = 'EXTERNAL_WEB',
  UNAVAILABLE = 'UNAVAILABLE',
}

export interface BillingEligibility {
  channel: BillingChannel;
  displayPrice: string;
  billingIntervalLabel: string;
  canRestore: boolean;
}

export interface IngrediaEntitlements {
  unlimitedScans: boolean;
  productComparison: boolean;
  personalizedPregnancyMode: boolean;
  completeHistory: boolean;
  monthlyScansRemaining: number;
}

export type StripeCheckoutState =
  | { status: 'IDLE' }
  | { status: 'CREATING_SUBSCRIPTION' }
  | { status: 'INITIALIZING_PAYMENT_SHEET' }
  | { status: 'PRESENTING_PAYMENT_SHEET' }
  | { status: 'AWAITING_SERVER_CONFIRMATION'; subscriptionId: string }
  | { status: 'ACTIVE'; subscriptionId: string }
  | { status: 'CANCELED' }
  | { status: 'FAILURE'; message: string };
