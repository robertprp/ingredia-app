# Ingredia API subscription implementation specification

Status: implementation-ready backend specification  
Target API: NestJS 11, Prisma 7, PostgreSQL, Better Auth  
Target client: Ingredia Expo SDK 57 application  
Last reviewed: 2026-08-31

## 1. Executive decision

Ingredia Plus unlocks digital functionality consumed inside the mobile application. The API must therefore support multiple billing providers behind one server-authoritative entitlement model:

- Apple App Store subscriptions for standard App Store distribution.
- Google Play subscriptions for standard Google Play distribution.
- Stripe subscriptions only for web, direct distribution, and mobile storefronts where Ingredia is enrolled and legally permitted to offer alternative billing.
- External web checkout only where linking to it is allowed.
- An unavailable state when no compliant purchase channel can be shown.

Stripe alone is not sufficient for the App Store and Google Play release. Apple generally requires In-App Purchase when an app unlocks digital functionality, while Google Play generally requires Play Billing for digital content and features. Both platforms have regional exceptions and alternative-billing programs, so the API—not the mobile UI—must select the channel. See the current [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) and [Google Play Payments policy](https://support.google.com/googleplay/android-developer/answer/10281818).

The mobile application must never infer subscription access from a successful payment screen. Access is enabled only after the API verifies the provider state and returns active entitlements.

## 2. Recommended MVP scope

Implement the common subscription domain first, then providers in this order:

1. Channel-neutral plans, subscriptions, entitlements, persistence, and API contracts.
2. Stripe for web and direct distribution.
3. App Store subscriptions and App Store Server Notifications V2.
4. Google Play subscriptions and Real-time Developer Notifications.
5. Alternative-billing programs only after product/legal enrollment is confirmed.

Recommended commercial scope for the first release:

- One plan: `INGREDIA_PLUS_MONTHLY`.
- One entitlement bundle: Ingredia Plus.
- No trial, coupons, upgrade/downgrade, family sharing, or prorations in the first release.
- Cancellation and billing management remain provider-owned.
- Cross-platform access is supported through the Ingredia account after provider verification.
- Only one effective Plus subscription is needed per user, although historical and overlapping provider records must remain stored.

Annual billing can be added later without changing the domain model.

## 3. Non-negotiable invariants

1. The API is the source of truth for entitlements.
2. The client never submits a Stripe Price ID, Apple entitlement status, Google subscription status, amount, currency, or localized price as trusted data.
3. Provider product identifiers are mapped from server-owned plan configuration.
4. Every purchase is attached to an authenticated Ingredia user.
5. Webhook and store-notification processing is signature-verified and idempotent.
6. Duplicate and out-of-order provider events cannot grant duplicate or stale access.
7. Payment completion does not directly grant access; verified provider state does.
8. Revocations and refunds remove access promptly.
9. A provider can manage only subscriptions that it owns.
10. Localized prices come from Stripe or the relevant store, never from hardcoded mobile strings.
11. Test/sandbox and live/production records cannot be mixed.
12. Provider secrets, purchase tokens, signed payloads, and customer details must not appear in application logs.

## 4. Existing API changes

### 4.1 Root body parsing

The current `src/main.ts` creates Nest with `bodyParser: false`. Replace that with Nest's raw-body support:

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  rawBody: true,
});
```

This keeps the normal JSON parser enabled and exposes `request.rawBody` for provider signature verification. Nest explicitly warns that its raw-body feature does not work when `bodyParser: false` is used. See [NestJS raw-body documentation](https://docs.nestjs.com/faq/raw-body).

Apply an explicit small request-size limit to webhook and purchase-verification routes. Provider notifications do not need multi-megabyte bodies.

### 4.2 Application composition

Add `BillingModule` to `AppModule`. The module owns billing behavior and feature-owned billing tables; it may reference the Better Auth `User` table but must not modify Better Auth-owned tables.

### 4.3 Environment validation

Extend `src/config/environment.ts` with typed, startup-validated configuration. Required values depend on enabled providers.

```text
BILLING_POLICY_VERSION
BILLING_DEFAULT_CHANNEL
BILLING_STRIPE_ENABLED
BILLING_APP_STORE_ENABLED
BILLING_GOOGLE_PLAY_ENABLED

STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PLUS_MONTHLY_PRICE_ID
STRIPE_CUSTOMER_PORTAL_RETURN_URL

APPLE_BUNDLE_ID
APPLE_APP_ID
APPLE_ISSUER_ID
APPLE_KEY_ID
APPLE_PRIVATE_KEY
APPLE_ENVIRONMENT
APPLE_PLUS_MONTHLY_PRODUCT_ID

GOOGLE_PLAY_PACKAGE_NAME
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64
GOOGLE_PLAY_PUBSUB_AUDIENCE
GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID
GOOGLE_PLAY_PLUS_MONTHLY_BASE_PLAN_ID
```

Rules:

- A provider's variables become required when that provider is enabled.
- Never commit private keys, service-account JSON, or webhook secrets.
- Pin the Stripe API version deliberately in the Stripe adapter and ephemeral-key creation. Do not silently adopt the account default version.
- Validate public URLs as HTTPS in production.
- Keep sandbox/test and production values separate.

### 4.4 Provider dependencies

Install provider libraries only when their implementation phase begins, using the API repository's npm lockfile:

```bash
npm install stripe
npm install @apple/app-store-server-library
npm install googleapis google-auth-library
```

Review and lock the resolved versions rather than using an unpinned runtime install. Apple publishes and maintains the official [`@apple/app-store-server-library`](https://github.com/apple/app-store-server-library-node), including JWS verification and App Store Server API clients. Google's officially supported Node client is [`googleapis`](https://github.com/googleapis/google-api-nodejs-client).

## 5. Billing module structure

Follow the API repository's modular-monolith and hexagonal conventions:

```text
src/modules/billing/
  billing.module.ts
  domain/
    billing-channel.ts
    billing-provider.ts
    subscription-status.ts
    entitlement-key.ts
    billing-plan.ts
    billing-policy.ts
    errors/
  application/
    commands/
      create-stripe-subscription.ts
      verify-app-store-transaction.ts
      verify-google-play-purchase.ts
      process-stripe-event.ts
      process-app-store-notification.ts
      process-google-play-notification.ts
      create-management-session.ts
    queries/
      get-billing-eligibility.ts
      get-billing-plans.ts
      get-current-subscription.ts
      get-user-entitlements.ts
    services/
      entitlement-projector.ts
      subscription-reconciler.ts
    ports/
      billing-store.port.ts
      stripe-gateway.port.ts
      app-store-gateway.port.ts
      google-play-gateway.port.ts
      billing-policy.port.ts
      clock.port.ts
  infrastructure/
    persistence/
      prisma-billing.repository.ts
    stripe/
      stripe.client.ts
      stripe-webhook-verifier.ts
      stripe-subscription.mapper.ts
    app-store/
      app-store.client.ts
      app-store-jws-verifier.ts
      app-store-subscription.mapper.ts
    google-play/
      google-play.client.ts
      google-play-rtdn-verifier.ts
      google-play-subscription.mapper.ts
    policy/
      configured-billing-policy.ts
  presentation/
    http/
      billing.controller.ts
      stripe-webhook.controller.ts
      app-store-webhook.controller.ts
      google-play-webhook.controller.ts
      dto/
      presenters/
```

Domain and application code must not import Stripe, Apple, Google, Prisma, Express, or Nest types. Provider-specific payloads stay inside infrastructure adapters.

## 6. Domain contracts

### 6.1 Channels and providers

```typescript
export enum BillingChannel {
  STRIPE = 'STRIPE',
  APP_STORE = 'APP_STORE',
  GOOGLE_PLAY = 'GOOGLE_PLAY',
  EXTERNAL_WEB = 'EXTERNAL_WEB',
  UNAVAILABLE = 'UNAVAILABLE',
}

export enum BillingProvider {
  STRIPE = 'STRIPE',
  APP_STORE = 'APP_STORE',
  GOOGLE_PLAY = 'GOOGLE_PLAY',
}

export enum SubscriptionStatus {
  PENDING = 'PENDING',
  TRIALING = 'TRIALING',
  ACTIVE = 'ACTIVE',
  GRACE_PERIOD = 'GRACE_PERIOD',
  PAST_DUE = 'PAST_DUE',
  PAUSED = 'PAUSED',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}
```

Provider adapters map external states to these values. Controllers and mobile contracts must never expose raw provider enums.

### 6.2 Plan identifiers

```typescript
export enum BillingPlanId {
  INGREDIA_PLUS_MONTHLY = 'INGREDIA_PLUS_MONTHLY',
}
```

The client submits only `BillingPlanId`. The server resolves it to:

- A Stripe recurring Price ID.
- An App Store product ID.
- A Google Play subscription product and base-plan ID.

### 6.3 Entitlement identifiers

```typescript
export enum EntitlementKey {
  UNLIMITED_SCANS = 'UNLIMITED_SCANS',
  PRODUCT_COMPARISON = 'PRODUCT_COMPARISON',
  PERSONALIZED_PREGNANCY_MODE = 'PERSONALIZED_PREGNANCY_MODE',
  COMPLETE_HISTORY = 'COMPLETE_HISTORY',
}
```

The public `/me/entitlements` presenter maps these keys into the mobile response. Do not make the mobile application interpret a generic feature map.

## 7. Persistence model

Create one Prisma migration for feature-owned billing tables. The following is a target model, not a copy-paste substitute for reviewing indexes, names, and migration SQL.

### 7.1 Required tables

#### `billing_plan`

Stores internal commercial plans.

```text
id                  BillingPlanId, primary key
name                Human-readable internal name
interval            MONTH or YEAR
isActive            Boolean
createdAt
updatedAt
```

#### `billing_product`

Maps an internal plan to provider-owned catalog identifiers.

```text
id
planId
provider            STRIPE, APP_STORE, GOOGLE_PLAY
environment         TEST or LIVE
platform            WEB, IOS, ANDROID
externalProductId   Stripe product, Apple product, or Play product
externalPriceId     Stripe price when applicable
externalBasePlanId  Google Play base plan when applicable
externalOfferId     Optional future Google Play offer
isActive
createdAt
updatedAt
```

Add unique constraints that prevent two active mappings for the same provider/environment/catalog identifier.

#### `plan_entitlement`

Defines the features granted by a plan.

```text
id
planId
key                 EntitlementKey
booleanValue        Nullable Boolean
integerValue        Nullable Int
createdAt
updatedAt
unique(planId, key)
```

Domain validation must require exactly one value type for each entitlement row.

#### `billing_customer`

Maps an Ingredia user to a provider customer identity. Stripe requires this; future providers may use it.

```text
id
userId              Foreign key to User
provider
environment
externalCustomerId
createdAt
updatedAt
unique(userId, provider, environment)
unique(provider, environment, externalCustomerId)
```

#### `billing_subscription`

Stores the normalized lifecycle and provider references.

```text
id
userId              Foreign key to User
planId
provider
environment
status
externalSubscriptionId   Stripe subscription ID or Apple original transaction ID
externalCustomerId       Nullable
externalProductId
googlePurchaseTokenHash  Nullable, deterministic lookup hash
googlePurchaseTokenCiphertext Nullable, encrypted at rest
appAccountToken          Nullable UUID
currentPeriodStart       Nullable
currentPeriodEnd         Nullable
trialEnd                 Nullable
cancelAtPeriodEnd        Boolean
canceledAt               Nullable
revokedAt                Nullable
latestProviderEventAt    Nullable
createdAt
updatedAt
```

Constraints:

- Provider/environment/external subscription reference must be unique when present.
- Google purchase-token hash must be unique when present.
- App Store `appAccountToken` must match the authenticated Ingredia user association.
- Never store Google purchase tokens in plaintext.
- Historical subscriptions are retained; cancellation does not delete rows.

#### `billing_checkout_attempt`

Prevents repeated taps and network retries from creating duplicate Stripe subscriptions.

```text
id
userId
planId
provider
idempotencyKey       Unique per user operation
status               CREATED, PROVIDER_CREATED, COMPLETED, FAILED, EXPIRED
externalSubscriptionId Nullable
failureCode          Nullable safe internal code
expiresAt
createdAt
updatedAt
unique(userId, idempotencyKey)
```

#### `billing_webhook_event`

Provides durable deduplication and operational visibility.

```text
id
provider
externalEventId
eventType
environment
status               RECEIVED, PROCESSING, PROCESSED, IGNORED, FAILED
providerCreatedAt
receivedAt
processedAt          Nullable
attemptCount
payloadHash
failureCode          Nullable
subscriptionId       Nullable
unique(provider, environment, externalEventId)
```

Store only the minimum payload required for audit and replay. If raw provider payload retention is required, encrypt it and define a short retention period.

#### `entitlement_grant`

Stores provider-independent feature grants.

```text
id
userId
subscriptionId
key
active
validFrom
validUntil           Nullable
createdAt
updatedAt
unique(subscriptionId, key)
index(userId, key, active, validUntil)
```

Keep a grant per subscription source. This avoids incorrectly removing access when one of multiple overlapping subscriptions ends.

#### `usage_period`

Tracks free and paid scan allowances independently from provider state.

```text
id
userId
periodStart
periodEnd
scansUsed
createdAt
updatedAt
unique(userId, periodStart)
```

The entitlement query calculates `monthlyScansRemaining`; it must not trust a client-side counter.

### 7.2 Seed data

Seed the internal plan, provider mappings, and plan entitlements. Provider IDs must be read from validated configuration or environment-specific seed input, not committed production IDs.

## 8. Public API contracts

All authenticated endpoints use the Better Auth session. Webhook endpoints are anonymous at the Better Auth layer but require provider verification.

### 8.1 Endpoint list

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/billing/eligibility` | Better Auth | Select the permitted billing channel |
| `GET` | `/api/v1/billing/plans` | Better Auth | Return channel-specific plan references and display data |
| `GET` | `/api/v1/billing/subscription` | Better Auth | Return the user's current normalized subscription |
| `GET` | `/api/v1/me/entitlements` | Better Auth | Return server-authoritative feature access |
| `POST` | `/api/v1/billing/stripe/subscriptions` | Better Auth | Create an incomplete eligible Stripe subscription |
| `POST` | `/api/v1/billing/stripe/customer-portal` | Better Auth | Create a Stripe management session |
| `POST` | `/api/v1/billing/app-store/transactions/verify` | Better Auth | Verify and attach a StoreKit transaction |
| `POST` | `/api/v1/billing/google-play/purchases/verify` | Better Auth | Verify and attach a Play purchase token |
| `POST` | `/api/v1/billing/restore` | Better Auth | Reconcile purchases supplied by the owning store |
| `POST` | `/api/v1/webhooks/stripe` | Stripe signature | Process Stripe events |
| `POST` | `/api/v1/webhooks/app-store` | Apple JWS | Process App Store Notifications V2 |
| `POST` | `/api/v1/webhooks/google-play` | Pub/Sub OIDC + provider lookup | Process Google Play RTDN |

### 8.2 Eligibility request

Use explicit headers or an equivalent validated query contract:

```text
X-Ingredia-Platform: IOS | ANDROID | WEB
X-Ingredia-Distribution: APP_STORE | GOOGLE_PLAY | DIRECT | WEB
X-Ingredia-Storefront: ISO-3166 country code
X-Ingredia-App-Build: positive integer
```

These values are hints, not proof. The server policy must fail closed. A normal App Store build receives `APP_STORE` unless a specifically enrolled and configured exception applies; a normal Google Play build receives `GOOGLE_PLAY` unless an enrolled alternative-billing program applies.

Example response:

```json
{
  "channel": "APP_STORE",
  "reasonCode": "APP_STORE_DIGITAL_FEATURES",
  "policyVersion": "2026-08-31.1",
  "plans": [
    {
      "planId": "INGREDIA_PLUS_MONTHLY",
      "productReference": "com.nooveller.ingredia.plus.monthly",
      "displayPrice": null,
      "displayPriceSource": "STORE"
    }
  ],
  "restoreSupported": true,
  "managementChannel": "APP_STORE"
}
```

For Stripe, return currency and minor-unit amount retrieved from the configured Stripe Price, plus a server-formatted display value when appropriate. For Apple and Google, the client retrieves the localized store price using the returned product reference.

### 8.3 Stripe subscription creation

Request:

```http
POST /api/v1/billing/stripe/subscriptions
Idempotency-Key: 7d5d9d55-...
Content-Type: application/json
```

```json
{
  "planId": "INGREDIA_PLUS_MONTHLY"
}
```

Response:

```json
{
  "subscriptionId": "sub_...",
  "clientSecret": "pi_..._secret_...",
  "ephemeralKey": "ek_...",
  "customerId": "cus_..."
}
```

Rules:

- Re-run eligibility on the server for this request.
- Reject the request unless the effective channel is `STRIPE`.
- Resolve `planId` to a server-owned Stripe Price ID.
- Reuse or create exactly one Stripe Customer per user/environment.
- Add internal user, plan, and checkout-attempt identifiers to Stripe metadata.
- Create the subscription with incomplete payment behavior and save the successful default payment method.
- Expand the latest invoice confirmation secret as required by the current pinned Stripe API version.
- Create the ephemeral key using the same pinned API version expected by the mobile SDK.
- Use both the local checkout-attempt key and Stripe idempotency keys.
- Never grant entitlements in this handler.
- If the user already has effective Plus access, return a stable conflict such as `SUBSCRIPTION_ALREADY_ACTIVE`.

Stripe's current React Native flow creates a Customer, an incomplete Subscription, a confirmation secret, and an ephemeral key for PaymentSheet. See [Stripe's mobile subscription guide](https://docs.stripe.com/billing/subscriptions/build-subscriptions?payment-ui=mobile&platform=react-native).

### 8.4 Entitlements response

```json
{
  "tier": "PLUS",
  "subscription": {
    "provider": "APP_STORE",
    "status": "ACTIVE",
    "currentPeriodEnd": "2026-10-01T00:00:00.000Z",
    "cancelAtPeriodEnd": false
  },
  "unlimitedScans": true,
  "productComparison": true,
  "personalizedPregnancyMode": true,
  "completeHistory": true,
  "monthlyScansRemaining": 0,
  "updatedAt": "2026-08-31T15:00:00.000Z"
}
```

For a free user, `subscription` is `null`, paid features are false, and `monthlyScansRemaining` contains the server-calculated allowance.

Add `Cache-Control: private, no-store` because this is user-specific authorization state.

### 8.5 Stable error envelope

```json
{
  "code": "BILLING_CHANNEL_NOT_ELIGIBLE",
  "message": "This billing option is not available for this storefront.",
  "retryable": false,
  "correlationId": "req_..."
}
```

Required codes include:

```text
BILLING_CHANNEL_NOT_ELIGIBLE
BILLING_PLAN_NOT_FOUND
BILLING_PLAN_INACTIVE
SUBSCRIPTION_ALREADY_ACTIVE
PURCHASE_ALREADY_LINKED
PURCHASE_USER_MISMATCH
PURCHASE_NOT_ACTIVE
PURCHASE_PENDING
PROVIDER_TEMPORARILY_UNAVAILABLE
INVALID_PROVIDER_SIGNATURE
INVALID_PROVIDER_PAYLOAD
IDEMPOTENCY_KEY_REQUIRED
IDEMPOTENCY_CONFLICT
```

Do not forward Stripe, Apple, or Google error messages directly to clients.

## 9. Billing eligibility policy

Implement eligibility as a versioned first-party policy, not scattered controller conditionals.

### 9.1 Inputs

```text
Authenticated user ID
Platform
Distribution channel
Storefront country
Application build
Server environment
Provider feature flags
Alternative-billing enrollment configuration
Commercial policy version
Existing subscription owner/provider
```

### 9.2 Conservative default matrix

| Distribution | Default channel | Notes |
| --- | --- | --- |
| iOS App Store | `APP_STORE` | Digital features normally use In-App Purchase |
| Google Play | `GOOGLE_PLAY` | Digital features normally use Play Billing |
| Web | `STRIPE` | Standard Stripe subscription flow |
| Direct Android distribution | `STRIPE` | Only if commercial/legal policy permits |
| Unknown distribution/storefront | `UNAVAILABLE` | Fail closed |

Regional Stripe or external-link exceptions must be explicitly configured by policy version and must depend on confirmed program enrollment. Do not infer permission merely from a country code. Store policies can change, so this matrix needs an operational owner and periodic review.

If a user already has an active subscription, the management channel is always the provider that owns that subscription even if current purchase eligibility differs.

## 10. Stripe provider flow

### 10.1 Creation

1. Authenticate the user.
2. Validate the idempotency key and plan.
3. Evaluate billing eligibility.
4. Reject duplicate effective Plus access.
5. Resolve or create the Stripe Customer.
6. Create a checkout-attempt record.
7. Create the incomplete Stripe Subscription using the server-owned Price.
8. Persist the external subscription reference as `PENDING`.
9. Return the PaymentSheet secrets.
10. Wait for verified Stripe events before granting access.

Do not keep a database transaction open while calling Stripe. Persist intent, perform the network call with an idempotency key, then reconcile the database result.

### 10.2 Webhook endpoint

The controller must:

1. Read `request.rawBody`.
2. Read the `Stripe-Signature` header.
3. Verify with `stripe.webhooks.constructEvent` and the configured endpoint secret.
4. Reject invalid signatures with HTTP 400.
5. Insert the external event ID into `billing_webhook_event`.
6. Return HTTP 200 for an already-processed duplicate.
7. Dispatch the verified event to the application handler.

Stripe requires the untouched raw body for signature verification. See [Stripe webhook documentation](https://docs.stripe.com/webhooks?lang=node) and [signature troubleshooting](https://docs.stripe.com/webhooks/signature?lang=node).

### 10.3 Stripe events

Process at minimum:

```text
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.paid
invoice.payment_failed
payment_intent.succeeded
payment_intent.payment_failed
```

If Stripe Entitlements is adopted, also process:

```text
entitlements.active_entitlement_summary.updated
```

Ingredia should still keep its own cross-provider entitlement projection even if Stripe Entitlements is enabled. Stripe documents subscription lifecycle events and entitlement-summary events in its [subscription webhook guide](https://docs.stripe.com/billing/subscriptions/webhooks).

### 10.4 Event transaction

For a verified event:

1. Resolve the user through the stored Stripe Customer or trusted subscription metadata.
2. Map provider status to the internal status.
3. Ignore stale state updates when their provider timestamp predates the stored authoritative state, or retrieve the latest subscription from Stripe before applying.
4. In one Prisma transaction:
   - Update the normalized subscription.
   - Recompute grants for that subscription.
   - Mark the event processed.
5. Record a safe failure code and leave the event retryable if processing fails.

Stripe can retry undelivered events for multiple days, so handlers must remain idempotent and replayable. See [Stripe undelivered event handling](https://docs.stripe.com/webhooks/process-undelivered-events).

### 10.5 Customer management

For Stripe-owned subscriptions, `POST /stripe/customer-portal` creates a short-lived Customer Portal session using a fixed allowlisted return URL. Verify that the Customer belongs to the authenticated user.

App Store and Google Play subscriptions must never be modified through Stripe.

## 11. App Store provider flow

### 11.1 Purchase association

Generate a stable UUID `appAccountToken` per Ingredia user. The mobile purchase flow supplies it to StoreKit. Apple returns the token in transaction and renewal information, allowing the API to associate the purchase with the correct account. See Apple's [`appAccountToken` documentation](https://developer.apple.com/documentation/appstoreserverapi/appaccounttoken).

### 11.2 Transaction verification endpoint

The authenticated client submits signed StoreKit 2 transaction information after purchase or restore. The API must:

1. Verify the JWS signature using Apple's server library and trusted root certificates.
2. Validate bundle ID, product ID, environment, transaction dates, and ownership type.
3. Validate that `appAccountToken` belongs to the authenticated user.
4. Use the original transaction ID as the stable subscription reference.
5. Query App Store Server API when current status is needed.
6. Upsert the normalized subscription and entitlement grants transactionally.
7. Reject a transaction already linked to a different Ingredia user.

Apple's [App Store Server API](https://developer.apple.com/documentation/appstoreserverapi) returns signed transaction and renewal data and supports retrieving all subscription statuses.

### 11.3 App Store Server Notifications V2

Implement only V2. Version 1 is deprecated.

The endpoint receives `signedPayload` and must:

1. Verify the outer JWS.
2. Verify nested signed transaction and renewal payloads.
3. Validate bundle ID, app ID, and environment.
4. Deduplicate by `notificationUUID`.
5. Resolve the original transaction and user.
6. Update the normalized subscription and grants.
7. Return success for duplicates.

Handle subscription renewals, expiration, billing retry, grace period, refunds, revocation, and product changes. Apple recommends App Store Server Notifications V2; see the [notification changelog](https://developer.apple.com/documentation/appstoreservernotifications/app-store-server-notifications-changelog).

### 11.4 Reconciliation

Use `Get All Subscription Statuses` for scheduled reconciliation and ambiguous notifications. Keep sandbox and production base URLs separate. A revoked transaction removes grants immediately.

## 12. Google Play provider flow

### 12.1 Purchase verification

After the Android billing flow, the authenticated client submits the purchase token and selected internal plan. The API must:

1. Resolve the server-owned package, product, and base-plan IDs.
2. Call `purchases.subscriptionsv2.get` with the purchase token.
3. Verify package, product, base plan, state, expiry, and linked purchase information.
4. Reject `PENDING` purchases without granting access.
5. Store an encrypted purchase token plus a deterministic lookup hash.
6. Prevent a token from being linked to multiple users.
7. Persist the normalized subscription and grants.
8. Acknowledge a newly purchased token from the backend after successful entitlement persistence.

Google recommends verification and acknowledgement through the secure backend. Initial purchases and purchases with new tokens must be acknowledged within the provider window or they can be refunded. See [Google Play Billing integration](https://developer.android.com/google/play/billing/integrate.html) and [`purchases.subscriptionsv2.get`](https://developers.google.com/android-publisher/api-ref/rest/v3/purchases/subscriptionsv2/get).

If acknowledgement fails after persistence, record an outbox/retry job. Do not ask the user to buy again.

### 12.2 Real-time Developer Notifications

Configure Google Cloud Pub/Sub push delivery. The endpoint must:

1. Authenticate the Pub/Sub push request using its configured OIDC audience/service account.
2. Deduplicate using Pub/Sub `messageId`.
3. Decode the base64 message data.
4. Validate package name and notification shape.
5. Treat the RTDN only as a change signal.
6. Call Google Play Developer API for the complete authoritative state.
7. Update subscription and grants transactionally.
8. Acknowledge Pub/Sub only after durable handling or durable retry scheduling.

Google explicitly states that RTDN does not contain complete purchase status and the backend must query the Developer API. See the [RTDN reference](https://developer.android.com/google/play/billing/rtdn-reference) and [backend integration guide](https://developer.android.com/google/play/billing/backend).

### 12.3 Restore and token changes

The client queries its purchases and sends current tokens to `/billing/restore`. The server verifies each token. Plan changes and re-signups can create new tokens, so preserve linked-purchase history and acknowledge every new token that requires acknowledgement.

## 13. Entitlement projection rules

The projector receives a normalized subscription and updates grants for its plan.

Recommended default access mapping:

| Internal status | Plus access |
| --- | --- |
| `TRIALING` | Yes, if trials are later enabled |
| `ACTIVE` | Yes |
| `GRACE_PERIOD` | Yes until the provider grace deadline |
| `PENDING` | No |
| `PAST_DUE` | No unless an explicit grace policy applies |
| `PAUSED` | No |
| `CANCELED` | Yes only until a verified paid period end; then no |
| `EXPIRED` | No |
| `REVOKED` | No immediately |

Provider-specific mapping details:

- Stripe `active` and `trialing` grant access. `incomplete`, `incomplete_expired`, and `unpaid` do not. Decide explicitly whether `past_due` receives a bounded grace period.
- App Store active and Billing Grace Period grant access. Expired and revoked do not. Billing retry without grace does not automatically grant access.
- Google active and in-grace-period states grant access. Pending, paused, on-hold, expired, and revoked states do not. A voluntarily canceled subscription may retain access through its verified paid expiry.

On every transition, recompute the grants for the subscription rather than applying scattered enable/disable booleans.

The effective user entitlement is active if at least one unexpired, non-revoked grant exists for that entitlement key.

## 14. Concurrency and idempotency

### 14.1 Client commands

- Require `Idempotency-Key` on subscription-creation and purchase-attachment commands.
- Scope the key to user and operation.
- The same key and same request returns the original result.
- The same key with different input returns `IDEMPOTENCY_CONFLICT`.

### 14.2 Provider events

- Unique provider event IDs prevent duplicate processing.
- Lock the subscription row or use optimistic versioning when updating lifecycle state.
- Compare provider event times and fetch current provider state for ambiguous ordering.
- Never assume webhook delivery order.
- Never perform a provider network call inside a long-running database transaction.

### 14.3 Duplicate subscriptions

Before creating a new purchase, check effective grants and provider records. If a user has Plus through another provider, show management information for the owning provider instead of creating an accidental second subscription.

## 15. Security and privacy

- Better Auth session is mandatory for all user billing endpoints.
- Enforce user ownership in application use cases, not only controllers.
- Verify every webhook signature or authenticated transport before parsing trusted fields.
- Validate every external payload at runtime and map it to first-party types.
- Encrypt Google purchase tokens and any retained signed payloads at rest.
- Never log client secrets, ephemeral keys, Stripe signatures, Apple JWS bodies, Google purchase tokens, service-account credentials, cookies, or authorization headers.
- Redact provider payloads in error reporting.
- Use explicit CORS origins; do not use `origin: true` in production.
- Rate-limit checkout creation, purchase verification, restore, and portal-session creation.
- Use HTTPS and TLS 1.2 or newer for provider traffic.
- Use least-privilege Stripe keys, Apple keys, Google service accounts, and Pub/Sub roles.
- Return generic provider failures with a correlation ID.
- Keep webhook endpoints exempt from Better Auth but never exempt from provider verification.

## 16. Reconciliation and operations

Webhooks are primary but not sufficient as the only repair mechanism.

Implement scheduled reconciliation:

- Reconcile `PENDING`, `PAST_DUE`, and recently changed subscriptions frequently.
- Reconcile all effective paid subscriptions at least daily.
- Retry failed provider events with bounded exponential backoff and jitter.
- Alert on events that exceed the retry budget.
- Alert on signature failures, unknown products, user-association conflicts, and growing webhook lag.
- Provide an admin-only reconciliation command by internal subscription ID.
- Do not expose a generic endpoint that accepts arbitrary provider IDs from regular users.

Suggested metrics:

```text
billing_webhook_received_total{provider,type}
billing_webhook_failed_total{provider,code}
billing_webhook_lag_seconds{provider}
billing_subscription_state_total{provider,status}
billing_checkout_created_total{provider,plan}
billing_checkout_failed_total{provider,code}
billing_entitlement_projection_failed_total{provider}
billing_reconciliation_drift_total{provider}
```

Do not use user IDs, purchase tokens, subscription IDs, or raw error messages as metric labels.

## 17. Testing requirements

### 17.1 Domain unit tests

- Every provider-to-domain status mapping.
- Entitlement grants for active, grace, canceled-before-expiry, expired, and revoked states.
- Multiple overlapping provider grants.
- Billing eligibility matrix and fail-closed behavior.
- Plan-to-entitlement projection.

### 17.2 Application tests

- Stripe creation rejects non-Stripe eligibility.
- Raw provider price IDs are never accepted.
- Existing Plus access prevents duplicate checkout.
- Idempotency retry returns the original result.
- Idempotency conflict is rejected.
- Purchase already linked to another user is rejected.
- Provider outage returns a retryable safe error.

### 17.3 Webhook tests

- Valid signature succeeds.
- Invalid or missing signature returns 400.
- Duplicate event returns success without duplicate effects.
- Out-of-order event cannot regress authoritative state.
- Unknown product is quarantined and alerted.
- Database failure leaves the event retryable.
- Refund/revocation removes access.
- No secret or raw sensitive payload is logged.

### 17.4 Provider integration tests

- Stripe sandbox PaymentSheet with successful payment, cancellation, failure, and 3DS redirect.
- Stripe Customer Portal management.
- App Store sandbox purchase, renewal, cancellation, grace period, refund, and restore.
- Google Play license-test purchase, pending purchase, acknowledgement, renewal, account hold, cancellation, and restore.
- RTDN Pub/Sub push authentication and authoritative follow-up lookup.

### 17.5 E2E acceptance tests

1. Free user has the configured scan allowance and no Plus features.
2. Successful verified purchase activates all Plus entitlements.
3. A successful client payment screen without provider confirmation does not activate Plus.
4. Reinstall and sign-in restore access from the API.
5. A refund or revocation removes access.
6. Cancel-at-period-end preserves access until verified expiry.
7. A user cannot attach another user's purchase.
8. The wrong storefront never receives an ineligible Stripe action.
9. Store-owned subscriptions show the correct restore/management behavior.
10. Stripe-owned subscriptions open only the authenticated user's portal session.

## 18. Delivery sequence

### Phase 1: provider-neutral foundation

- Create the billing domain enums and plan model.
- Add Prisma schema, migration, and seed data.
- Add billing repository port and Prisma adapter.
- Implement entitlement projection.
- Implement `/billing/eligibility`, `/billing/plans`, `/billing/subscription`, and `/me/entitlements`.
- Add the policy matrix and tests.

Exit criterion: a seeded subscription can be projected into correct mobile entitlements without any provider SDK.

### Phase 2: Stripe for web/direct distribution

- Install and configure the Stripe Node SDK.
- Change Nest bootstrap to `rawBody: true`.
- Implement Stripe Customer and subscription creation.
- Implement PaymentSheet response contract.
- Implement signed, idempotent webhook processing.
- Implement Customer Portal sessions.
- Add reconciliation and Stripe sandbox tests.

Exit criterion: Stripe activates Plus only through verified server events and remains hidden for ineligible store builds.

### Phase 3: App Store

- Configure the App Store subscription product.
- Add App Store server credentials and JWS verification.
- Implement stable per-user `appAccountToken`.
- Implement transaction verification and restore.
- Implement Server Notifications V2.
- Add reconciliation through App Store Server API.
- Test in sandbox and TestFlight.

Exit criterion: purchase, renewal, cancellation, grace, refund, revocation, and restore all update the same entitlement endpoint.

### Phase 4: Google Play

- Configure subscription product/base plan.
- Configure service account and Play Developer API access.
- Implement purchase-token verification and encrypted storage.
- Implement backend acknowledgement and retry.
- Configure Pub/Sub and authenticated RTDN push.
- Implement restore and token-change handling.
- Test through Play license testing and internal track.

Exit criterion: purchase, pending, renewal, hold, cancellation, refund, token changes, and restore all update the same entitlement endpoint.

### Phase 5: controlled launch

- Complete store policy and alternative-billing review.
- Configure live provider products and secrets.
- Verify production webhook endpoints.
- Run a low-volume internal release.
- Monitor webhook lag, reconciliation drift, refunds, and entitlement mismatches.
- Enable channels per build/storefront through a new policy version.

## 19. Decisions required from product and operations

Resolve these before production pricing is configured:

1. Monthly price and supported currencies.
2. Whether an annual plan is part of launch.
3. Whether a free trial is offered and by which providers.
4. Whether `PAST_DUE` receives any internal grace period.
5. Free monthly scan allowance and reset timezone.
6. Refund and customer-support process.
7. Whether simultaneous subscriptions from different providers are tolerated or blocked.
8. Which alternative-billing programs Ingredia has actually enrolled in.
9. Store product IDs, Stripe Product/Price IDs, bundle ID, and Play package name.
10. Data-retention period for provider event audit material.

Until these decisions are recorded, use the conservative channel matrix and do not expose Stripe inside App Store or Google Play builds.

## 20. API definition of done

The subscription backend is complete only when:

- All public contracts are documented in Swagger/OpenAPI.
- Prisma migrations and seed data are reviewed and reproducible.
- Provider secrets and environment-specific identifiers are validated at startup.
- Eligibility fails closed and is covered by a policy matrix test.
- Stripe, Apple, and Google lifecycle events are verified, idempotent, and replayable.
- Entitlements are provider-independent and server-authoritative.
- Purchase ownership is enforced.
- Refunds, revocations, expiry, and grace-period behavior are tested.
- Reconciliation detects and repairs drift.
- Build, lint, unit, integration, and E2E tests pass.
- Sandbox and production records cannot be confused.
- Production dashboards and alerts exist before enabling live purchases.

## 21. Primary references

- [Stripe React Native subscriptions](https://docs.stripe.com/billing/subscriptions/build-subscriptions?payment-ui=mobile&platform=react-native)
- [Stripe subscription webhooks](https://docs.stripe.com/billing/subscriptions/webhooks)
- [Stripe webhook signatures](https://docs.stripe.com/webhooks/signature?lang=node)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Apple App Store Server API](https://developer.apple.com/documentation/appstoreserverapi)
- [Apple App Store Server Notifications](https://developer.apple.com/documentation/appstoreservernotifications)
- [Google Play Payments policy](https://support.google.com/googleplay/android-developer/answer/10281818)
- [Google Play backend integration](https://developer.android.com/google/play/billing/backend)
- [Google Play RTDN reference](https://developer.android.com/google/play/billing/rtdn-reference)
- [Google Play Developer API](https://developers.google.com/android-publisher/api-ref/rest)
- [NestJS raw body](https://docs.nestjs.com/faq/raw-body)
