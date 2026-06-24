/**
 * @openfoodfacts/react-native
 *
 * React Native SDK for Open Food Facts.
 *
 * Re-exports the full upstream `@openfoodfacts/openfoodfacts-nodejs` API and
 * layers React Native–specific helpers on top:
 *
 * - **`createClient()`** – factory that auto-injects the global `fetch`
 * - **`<OpenFoodFactsProvider>`** – React Context provider
 * - **`useOpenFoodFacts()`** – access the client from any component
 * - **`useProduct(barcode)`** – fetch a product with loading/error state
 * - **`useSearch(query)`** – search products with loading/error state
 * - **`uploadImageFromUri()`** – upload images from RN local URIs
 * - **`createImageFile()` / `appendImageToForm()`** – low-level image utils
 *
 * @packageDocumentation
 */

// ── Re-export everything from the upstream SDK ──────────────────────────
// This lets consumers `import { OpenFoodFacts, BackendType, ... }` directly
// from this package without adding a second dependency.
export * from "@openfoodfacts/openfoodfacts-nodejs";
export { default as OpenFoodFacts } from "@openfoodfacts/openfoodfacts-nodejs";

// ── React Native client helpers ─────────────────────────────────────────
export { createClient, uploadImageFromUri } from "./client";
export type { CreateClientOptions } from "./client";

// ── React Context ───────────────────────────────────────────────────────
export {
  OpenFoodFactsProvider,
  OpenFoodFactsContext,
} from "./context";
export type { OpenFoodFactsProviderProps } from "./context";

// ── React hooks ─────────────────────────────────────────────────────────
export { useOpenFoodFacts } from "./hooks/useOpenFoodFacts";
export { useProduct } from "./hooks/useProduct";
export type { UseProductState } from "./hooks/useProduct";
export { useSearch } from "./hooks/useSearch";
export type { UseSearchState, SearchQuery } from "./hooks/useSearch";

// ── Image utilities ─────────────────────────────────────────────────────
export { createImageFile, appendImageToForm } from "./utils/image";
export type { ReactNativeFile } from "./utils/image";
