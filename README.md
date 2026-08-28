# NOOVELLER

NOOVELLER's Expo 57 application foundation uses Expo Router, NativeWind, and React Native Reusables.

## Development

```bash
npm install
npm start
```

`npm start` targets the custom development client. `npm run ios` and `npm run android` rebuild and launch that native client; `npm run web` launches the web app. For UI-only work in Expo Go, use `npm run start:go`—Didit verification remains unavailable there.

## UI components

Add React Native Reusables components through its registry:

```bash
npx @react-native-reusables/cli@latest add button
```

Shared brand tokens live in `src/global.css`, `tailwind.config.js`, and `src/lib/theme.ts`.

## Authentication

The Expo client uses Better Auth with SecureStore-backed sessions. Copy `.env.example` to `.env.local` and adjust `EXPO_PUBLIC_BETTER_AUTH_URL` for the target device:

- iOS Simulator and web: `http://localhost:3000`
- Android Emulator: `http://10.0.2.2:3000`
- Physical devices: a reachable LAN URL or HTTPS tunnel

The Better Auth server must trust `nooveller://` (plus Expo development origins), configure Google and Apple under `socialProviders`, and provide `emailAndPassword.sendResetPassword` for the forgot-password flow.

## Identity verification (Didit)

The app uses `@didit-protocol/sdk-react-native` 4.7.3 with its Expo config plugin. NFC is enabled and the generated native projects include the full Didit SDK. Didit's NFC support requires iOS 15.0+, while Expo 57 itself sets this app's effective iOS minimum to 16.4. Disable NFC in `app.json` to remove Didit's NFC dependencies and capabilities (this does not lower Expo 57's own minimum):

```json
[
  "@didit-protocol/sdk-react-native",
  { "iosNfcEnabled": false, "androidNfcEnabled": false }
]
```

The native SDK is unavailable in Expo Go. Adding or upgrading Didit requires a fresh native build; reloading Metro is not sufficient. Use the existing EAS development profile or make a local development build after installing dependencies:

```bash
eas build --profile development --platform ios
eas build --profile development --platform android

# Or build locally:
npx expo run:ios
npx expo run:android
```

The mobile app calls `POST /api/verification/start` on `EXPO_PUBLIC_BETTER_AUTH_URL`. Override the complete public endpoint URL with `EXPO_PUBLIC_DIDIT_SESSION_URL` when it is hosted elsewhere. The request includes the signed-in Better Auth cookie and an empty JSON body. The server must:

1. Require an authenticated user and derive `vendor_data` from that user's stable server-side ID.
2. Call `POST https://verification.didit.me/v3/session/` with `DIDIT_API_KEY` and `DIDIT_WORKFLOW_ID` from server-only environment variables.
3. Persist the Didit `session_id` to user association and return only `{ "session_id": "...", "session_token": "..." }`.
4. Forward Didit rate-limit responses appropriately, including `Retry-After` on HTTP 429.
5. Verify Didit's webhook signature, persist the final decision, and grant access from that server-side decision. The status returned by the mobile SDK is immediate UI feedback, not the authorization source of truth.

Never add `DIDIT_API_KEY` or `DIDIT_WORKFLOW_ID` to an `EXPO_PUBLIC_*` variable or send either value to the device.
