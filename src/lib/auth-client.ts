import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { usernameClient, organizationClient } from "better-auth/client/plugins"


const developmentURL = Platform.select({
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000',
});

export const betterAuthURL = process.env.EXPO_PUBLIC_BETTER_AUTH_URL ?? developmentURL;

export const authClient = createAuthClient({
  baseURL: betterAuthURL,
  plugins: [
    usernameClient(),
    organizationClient(),
    expoClient({
      scheme: 'nooveller',
      storagePrefix: 'nooveller',
      storage: SecureStore,
      // The backend overrides the session cookie name to `noveller.session`.
      cookiePrefix: 'noveller',
    }),
  ],
});
