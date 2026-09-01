export const apiQueryKeys = {
  additives: (search: string) => ['additives', search] as const,
  additive: (code: string) => ['additive', code] as const,
  analyses: (filter: 'RECENT' | 'SAVED') => ['analyses', filter] as const,
  analysis: (id: string) => ['analysis', id] as const,
  preferences: ['preferences'] as const,
  entitlements: ['entitlements'] as const,
  billing: ['billing'] as const,
};
