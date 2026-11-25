/**
 * React Context provider that makes an `OpenFoodFacts` client available
 * throughout a component tree via `useOpenFoodFacts()`.
 */

import {
  createContext,
  createElement,
  useMemo,
  type ReactNode,
} from "react";
import type OpenFoodFacts from "@openfoodfacts/openfoodfacts-nodejs";
import { createClient, type CreateClientOptions } from "./client";

/**
 * React Context holding the `OpenFoodFacts` client instance.
 * Use {@link useOpenFoodFacts} to consume it.
 */
export const OpenFoodFactsContext = createContext<OpenFoodFacts | null>(null);

/** Props for {@link OpenFoodFactsProvider}. */
export interface OpenFoodFactsProviderProps extends CreateClientOptions {
  /**
   * Pre-built client instance.  When provided, the `CreateClientOptions`
   * fields on this component are ignored.
   */
  client?: OpenFoodFacts;
  children: ReactNode;
}

/**
 * Provides an `OpenFoodFacts` client to descendant components.
 *
 * @example
 * ```tsx
 * import { OpenFoodFactsProvider } from "@openfoodfacts/react-native";
 *
 * export default function App() {
 *   return (
 *     <OpenFoodFactsProvider country="fr" language="fr">
 *       <MyScreen />
 *     </OpenFoodFactsProvider>
 *   );
 * }
 * ```
 */
export function OpenFoodFactsProvider({
  client: externalClient,
  children,
  ...options
}: OpenFoodFactsProviderProps) {
  const client = useMemo(() => {
    if (externalClient) return externalClient;
    return createClient(options);
  }, [
    externalClient,
    options.type,
    options.country,
    options.language,
    options.host,
    options.accessToken,
  ]);

  return createElement(
    OpenFoodFactsContext.Provider,
    { value: client },
    children,
  );
}
