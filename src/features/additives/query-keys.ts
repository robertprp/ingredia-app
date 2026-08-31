export interface SearchAdditivesQuery {
  search: string;
  cursor?: string;
}

export const additiveQueryKeys = {
  all: ['additives'] as const,
  list: (query: SearchAdditivesQuery) => [...additiveQueryKeys.all, 'list', query] as const,
  detail: (code: string) => [...additiveQueryKeys.all, 'detail', code] as const,
};
