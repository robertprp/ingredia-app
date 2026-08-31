# Ingredia mobile

Expo SDK 57 scaffold for Ingredia, built with Expo Router, strict TypeScript, NativeWind v4, Tailwind CSS v3, React Native Reusables, Better Auth, and TanStack Query.

## Run locally

```bash
npm install
cp .env.example .env
npm run start
```

Set `EXPO_PUBLIC_API_URL` to the Nest API origin. Android Emulator normally uses `http://10.0.2.2:3000`; iOS Simulator and web can use `http://localhost:3000`.

## Structure

- `src/app`: route groups and thin screen composition
- `src/components/ui`: source-owned React Native Reusables primitives
- `src/components/ingredia`: Ingredia-specific reusable components
- `src/features`: typed feature contracts, query keys, state machines, and fixtures
- `src/services`: adapters for API, billing, camera, and storage integrations
- `src/lib`: application-wide clients, routes, theme, and utilities

The current backend exposes authentication and identity-verification endpoints. Additive, scan, analysis, entitlements, and billing screens are intentionally fixture-backed behind typed boundaries until their generated API contracts are available.

## Checks

```bash
npm run lint -- --no-cache
npx tsc --noEmit
npx @react-native-reusables/cli@latest doctor -y
npx expo export --platform web
```

Before a production auth build, add `ingredia://` and `ingredia://*` to the backend Better Auth trusted origins.
