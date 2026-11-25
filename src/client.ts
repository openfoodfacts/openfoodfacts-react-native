/**
 * React Native wrapper around the `OpenFoodFacts` client from
 * `@openfoodfacts/openfoodfacts-nodejs`.
 *
 * Provides a factory that automatically injects the global `fetch` available
 * in React Native ≥ 0.72 and exposes convenience methods for React Native–
 * specific image uploads.
 */

import OpenFoodFacts from "@openfoodfacts/openfoodfacts-nodejs";
import type { OpenFoodFactsOptions } from "@openfoodfacts/openfoodfacts-nodejs";

import {
  createImageFile,
  appendImageToForm,
  type ReactNativeFile,
} from "./utils/image";

export type { OpenFoodFactsOptions };

/**
 * Options accepted by {@link createClient}.  Extends the upstream
 * `OpenFoodFactsOptions` with an optional custom `fetch` implementation.
 */
export interface CreateClientOptions extends OpenFoodFactsOptions {
  /**
   * Custom `fetch` function.  Defaults to `globalThis.fetch` which is
   * available in React Native ≥ 0.72.
   */
  fetch?: typeof globalThis.fetch;
}

/**
 * Create an `OpenFoodFacts` client pre-configured for React Native.
 *
 * @example
 * ```ts
 * import { createClient } from "@openfoodfacts/react-native";
 *
 * const client = createClient({ country: "fr", language: "fr" });
 * const product = await client.getProductV2("3017620422003");
 * ```
 */
export function createClient(options: CreateClientOptions = {}): OpenFoodFacts {
  const { fetch: customFetch, ...offOptions } = options;
  const fetchFn = customFetch ?? globalThis.fetch;

  if (!fetchFn) {
    throw new Error(
      "[@openfoodfacts/react-native] No `fetch` function found. " +
        "React Native ≥ 0.72 provides `fetch` globally. If you are running " +
        "an older version, pass a polyfill via the `fetch` option.",
    );
  }

  return new OpenFoodFacts(fetchFn, offOptions);
}

/**
 * Upload an image from a local React Native URI to a product.
 *
 * This is a convenience wrapper that bridges the gap between React Native's
 * URI-based image system and the upstream SDK's `File`-based upload API.
 *
 * @param client      – An `OpenFoodFacts` client instance.
 * @param barcode     – The product barcode.
 * @param imageUri    – A local image URI (e.g. from an image picker).
 * @param imagefield  – Which image slot to upload to
 *                       (`"front"`, `"ingredients"`, `"nutrition"`, `"packaging"`, `"other"`).
 * @param options     – Optional file name and MIME type overrides.
 * @param fetchFn     – Optional custom `fetch` function. Defaults to
 *                       `globalThis.fetch`.
 *
 * @example
 * ```ts
 * import { createClient, uploadImageFromUri } from "@openfoodfacts/react-native";
 *
 * const client = createClient();
 * await uploadImageFromUri(client, "3017620422003", "file:///tmp/photo.jpg", "front");
 * ```
 */
export async function uploadImageFromUri(
  client: OpenFoodFacts,
  barcode: string,
  imageUri: string,
  imagefield: string,
  options?: { name?: string; type?: string; fetch?: typeof globalThis.fetch },
): Promise<void> {
  const file = createImageFile(imageUri, options?.name, options?.type);
  const formData = new FormData();

  formData.append("code", barcode);
  formData.append("imagefield", imagefield);
  appendImageToForm(formData, `imgupload_${imagefield}`, file);

  const fetchFn = options?.fetch ?? globalThis.fetch;
  const baseUrl = getBaseUrl(client);

  await fetchFn(`${baseUrl}/cgi/product_image_upload.pl`, {
    method: "POST",
    body: formData,
  });
}

/**
 * Attempt to read the base URL from the client. Falls back to the default
 * world OFF URL.
 */
function getBaseUrl(client: OpenFoodFacts): string {
  // The upstream client stores the base URL internally. We try to extract
  // it from the V2 API client. If the internal structure changes, we fall
  // back to the default URL.
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v2 = client.apiv2 as any;
    if (v2?.baseUrl) return v2.baseUrl;
  } catch {
    // ignore
  }
  return "https://world.openfoodfacts.org";
}

export { ReactNativeFile, createImageFile, appendImageToForm };
