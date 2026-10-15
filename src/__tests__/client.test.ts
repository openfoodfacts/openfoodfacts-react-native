import { createClient } from "../client";

// Minimal mock of the upstream OpenFoodFacts class so we can test
// createClient without pulling in the full SDK + network.
jest.mock("@openfoodfacts/openfoodfacts-nodejs", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation((fetchFn, options) => ({
      _fetch: fetchFn,
      _options: options,
      getProductV2: jest.fn(),
      search: jest.fn(),
      apiv2: {},
      apiv3: {},
    })),
  };
});

describe("createClient", () => {
  it("creates a client using globalThis.fetch by default", () => {
    const mockFetch = jest.fn();
    globalThis.fetch = mockFetch;

    const client = createClient({ country: "fr" });
    expect(client).toBeDefined();
    // Verify the mock constructor was called with globalThis.fetch
    const OpenFoodFacts =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("@openfoodfacts/openfoodfacts-nodejs").default;
    expect(OpenFoodFacts).toHaveBeenCalledWith(mockFetch, { country: "fr" });
  });

  it("accepts a custom fetch function", () => {
    const customFetch = jest.fn() as unknown as typeof globalThis.fetch;
    const client = createClient({ fetch: customFetch, language: "en" });
    expect(client).toBeDefined();

    const OpenFoodFacts =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("@openfoodfacts/openfoodfacts-nodejs").default;
    expect(OpenFoodFacts).toHaveBeenCalledWith(customFetch, { language: "en" });
  });

  it("throws when no fetch is available", () => {
    const original = globalThis.fetch;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = undefined;

    expect(() => createClient()).toThrow(/No `fetch` function found/);

    globalThis.fetch = original;
  });
});
