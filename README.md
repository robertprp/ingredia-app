# NOOVELLER

NOOVELLER's Expo 57 application foundation uses Expo Router, NativeWind, and React Native Reusables.

## Development

```bash
npm install
npm start
```

Platform shortcuts are available through `npm run ios`, `npm run android`, and `npm run web`.

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
