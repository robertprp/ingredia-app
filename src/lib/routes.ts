import type { Href } from 'expo-router';

export const ROUTES = {
  login: '/login' as Href,
  tabs: '/(tabs)' as Href,
  scan: '/scan' as Href,
  profile: '/profile' as Href,
  additives: '/additives' as Href,
  subscription: '/subscription' as Href,
} as const;

export function analysisRoute(analysisId: string): Href {
  return `/analyses/${encodeURIComponent(analysisId)}` as Href;
}

export function additiveRoute(code: string): Href {
  return `/additives/${encodeURIComponent(code)}` as Href;
}
