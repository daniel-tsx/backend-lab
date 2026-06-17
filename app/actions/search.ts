'use server';

import { globalSearch, type SearchResult } from '@/db/queries/search';

export async function searchAction(query: string): Promise<SearchResult[]> {
  return globalSearch(query);
}
