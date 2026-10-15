import { useContext } from "react";
import type OpenFoodFacts from "@openfoodfacts/openfoodfacts-nodejs";
import { OpenFoodFactsContext } from "../context";

/**
 * Returns the `OpenFoodFacts` client from the nearest
 * {@link OpenFoodFactsProvider}.
 *
 * @throws If called outside a provider.
 *
 * @example
 * ```ts
 * const client = useOpenFoodFacts();
 * const product = await client.getProductV2("3017620422003");
 * ```
 */
export function useOpenFoodFacts(): OpenFoodFacts {
  const client = useContext(OpenFoodFactsContext);
  if (!client) {
    throw new Error(
      "useOpenFoodFacts() must be used within an <OpenFoodFactsProvider>.",
    );
  }
  return client;
}
