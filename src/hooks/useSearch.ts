import { useCallback, useEffect, useRef, useState } from "react";
import { useOpenFoodFacts } from "./useOpenFoodFacts";

/** The state returned by {@link useSearch}. */
export interface UseSearchState<T = unknown> {
  /** The search results, or `null` while loading / on error. */
  data: T | null;
  /** Whether the request is in-flight. */
  loading: boolean;
  /** The error, if any. */
  error: Error | null;
  /** Re-run the search with the current query. */
  refetch: () => void;
}

/**
 * Options for the V2 search API.
 *
 * This is intentionally a loose record so callers are not forced to import
 * the upstream `SearchQueryV2` type.
 */
export type SearchQuery = Record<string, unknown>;

/**
 * Search for products using the Open Food Facts V2 search API.
 *
 * The hook automatically triggers a search when `query` changes (compared
 * by JSON serialisation) and exposes loading / error state.
 *
 * Pass `null` or `undefined` to skip the request.
 *
 * @example
 * ```tsx
 * function SearchResults({ term }: { term: string }) {
 *   const { data, loading, error } = useSearch({
 *     search_terms: term,
 *     page_size: 10,
 *   });
 *
 *   if (loading) return <ActivityIndicator />;
 *   if (error)   return <Text>Error: {error.message}</Text>;
 *
 *   return data?.products?.map((p) => (
 *     <Text key={p.code}>{p.product_name}</Text>
 *   ));
 * }
 * ```
 */
export function useSearch<T = unknown>(
  query: SearchQuery | null | undefined,
): UseSearchState<T> {
  const client = useOpenFoodFacts();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Serialise the query so we can use it as a dependency without
  // requiring the caller to memoize the object.
  const queryKey = query ? JSON.stringify(query) : null;
  const latestKey = useRef(queryKey);
  latestKey.current = queryKey;

  const performSearch = useCallback(async () => {
    if (!query || !queryKey) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await client.search(query as any);
      if (latestKey.current === queryKey) {
        setData(result as T);
        setLoading(false);
      }
    } catch (err) {
      if (latestKey.current === queryKey) {
        setError(
          err instanceof Error ? err : new Error(String(err)),
        );
        setLoading(false);
      }
    }
  }, [queryKey, client]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  return { data, loading, error, refetch: performSearch };
}
