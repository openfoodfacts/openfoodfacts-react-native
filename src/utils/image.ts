/**
 * Utility helpers for converting React Native image URIs into a shape that
 * the upstream `@openfoodfacts/openfoodfacts-nodejs` image-upload methods
 * can accept.
 *
 * React Native does not provide the Web `File` API, so we bridge the gap
 * by creating a minimal object that `FormData.append()` accepts on both
 * Android and iOS (the React Native `FormData` implementation understands
 * `{ uri, type, name }` objects).
 */

/**
 * A React Native–compatible file descriptor that can be appended to
 * `FormData`.  React Native's `XMLHttpRequest` and `fetch` polyfills
 * know how to read `uri` fields when building multipart requests.
 */
export interface ReactNativeFile {
  /** Local `file://` or `content://` URI pointing to the image. */
  uri: string;
  /** MIME type, e.g. `"image/jpeg"`. */
  type: string;
  /** File name used in the multipart `Content-Disposition` header. */
  name: string;
}

/**
 * Create a {@link ReactNativeFile} descriptor from a local image URI.
 *
 * @param uri   – A local image URI (e.g. from `react-native-image-picker`
 *                or `expo-image-picker`).
 * @param name  – Optional file name.  Defaults to the last path segment of
 *                `uri`, falling back to `"photo.jpg"`.
 * @param type  – Optional MIME type.  Inferred from the file extension when
 *                omitted; defaults to `"image/jpeg"`.
 *
 * @example
 * ```ts
 * import { createImageFile } from "@openfoodfacts/react-native";
 *
 * const file = createImageFile("file:///tmp/photo.jpg");
 * // → { uri: "file:///tmp/photo.jpg", type: "image/jpeg", name: "photo.jpg" }
 * ```
 */
export function createImageFile(
  uri: string,
  name?: string,
  type?: string,
): ReactNativeFile {
  const inferredName =
    name ?? (uri.split("/").pop()?.split("?")[0] || "photo.jpg");

  const inferredType = type ?? mimeFromExtension(inferredName);

  return { uri, type: inferredType, name: inferredName };
}

/**
 * Append a React Native image to a `FormData` instance in the way the
 * Open Food Facts API expects.
 *
 * @param formData   – A `FormData` instance.
 * @param fieldName  – The form field name (e.g. `"imgupload_front"`).
 * @param file       – A {@link ReactNativeFile} (or a plain object with
 *                     `uri`, `type`, and `name`).
 */
export function appendImageToForm(
  formData: FormData,
  fieldName: string,
  file: ReactNativeFile,
): void {
  // React Native's FormData.append() accepts { uri, type, name } objects
  // as the value – the RN networking layer turns them into multipart file
  // parts automatically.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData.append(fieldName, file as any);
}

/** Map common image extensions to MIME types. */
const EXTENSION_MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};

function mimeFromExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_MIME_MAP[ext] ?? "image/jpeg";
}
