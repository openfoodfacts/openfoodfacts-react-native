/**
 * React hooks for consuming the Open Food Facts API.
 *
 * All hooks depend on an `OpenFoodFacts` client being available via
 * {@link OpenFoodFactsProvider} (or passed directly).
 */

export { useOpenFoodFacts } from "./useOpenFoodFacts";
export { useProduct } from "./useProduct";
export { useSearch } from "./useSearch";
