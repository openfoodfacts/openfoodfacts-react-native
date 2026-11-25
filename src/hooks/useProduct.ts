import { useCallback, useEffect, useRef, useState } from "react";
import { useOpenFoodFacts } from "./useOpenFoodFacts";

/** The state returned by {@link useProduct}. */
export interface UseProductState<T = unknown> {
  /** The product data, or `null` while loading / on error. */
  data: T | null;
  /** Whether the request is in-flight. */
  loading: boolean;
  /** The error, if any. */
  error: Error | null;
  /** Re-fetch the product. */
  refetch: () => void;
}

/**
 * Fetch a single product by barcode.
 *
 * Uses the V2 API under the hood. The hook automatically triggers a
 * fetch when `barcode` changes and exposes loading / error state.
 *
 * @param barcode – The product barcode (EAN / UPC). Pass `null` or
 *                  `undefined` to skip the request.
 *
 * @example
 * ```tsx
 * function ProductCard({ barcode }: { barcode: string }) {
 *   const { data, loading, error } = useProduct(barcode);
 *
 *   if (loading) return <ActivityIndicator />;
 *   if (error)   return <Text>Error: {error.message}</Text>;
 *   if (!data)   return <Text>Product not found</Text>;
 *
 *   return <Text>{data.product?.product_name}</Text>;
 * }
 * ```
 */
export function useProduct<T = unknown>(
  barcode: string | null | undefined,
): UseProductState<T> {
  const client = useOpenFoodFacts();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Track the latest barcode to avoid stale responses.
  const latestBarcode = useRef(barcode);
  latestBarcode.current = barcode;

  const fetchProduct = useCallback(async () => {
    if (!barcode) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await client.getProductV2(barcode);
      // Only update state if the barcode hasn't changed in the meantime.
      if (latestBarcode.current === barcode) {
        setData(result as T);
        setLoading(false);
      }
    } catch (err) {
      if (latestBarcode.current === barcode) {
        setError(
          err instanceof Error ? err : new Error(String(err)),
        );
        setLoading(false);
      }
    }
  }, [barcode, client]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { data, loading, error, refetch: fetchProduct };
}
