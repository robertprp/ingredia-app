import { expoClient, getSetCookie, storageAdapter } from '@better-auth/expo/client';
import { magicLinkClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

import { mobileConfig } from '@/config/mobile-config';

const AUTH_STORAGE_PREFIX = 'ingredia';
const AUTH_COOKIE_STORAGE_KEY = `${AUTH_STORAGE_PREFIX}_cookie`;

export const betterAuthURL = mobileConfig.apiUrl;

export const authClient = createAuthClient({
  baseURL: betterAuthURL,
  plugins: [
    expoClient({
      scheme: 'ingredia',
      storagePrefix: AUTH_STORAGE_PREFIX,
      storage: SecureStore,
    }),
    magicLinkClient(),
  ],
});

/**
 * Better Auth's Expo server plugin appends the native session cookie to the
 * magic-link callback URL. Persist it in the same store used by expoClient so
 * subsequent session requests are authenticated.
 */
export async function persistMagicLinkSessionCookie(setCookieHeader: string): Promise<void> {
  const storage = storageAdapter(SecureStore);
  const currentCookie = await storage.getItemAsync(AUTH_COOKIE_STORAGE_KEY);
  const nextCookie = getSetCookie(setCookieHeader, currentCookie ?? undefined);

  await storage.setItemAsync(AUTH_COOKIE_STORAGE_KEY, nextCookie);
}
