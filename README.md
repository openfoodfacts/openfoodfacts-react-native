# @openfoodfacts/react-native

[![npm version](https://img.shields.io/npm/v/@openfoodfacts/react-native.svg)](https://www.npmjs.com/package/@openfoodfacts/react-native)
[![CI](https://github.com/openfoodfacts/openfoodfacts-react-native/actions/workflows/ci.yml/badge.svg)](https://github.com/openfoodfacts/openfoodfacts-react-native/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

React Native SDK for [Open Food Facts](https://world.openfoodfacts.org/) — wraps [`@openfoodfacts/openfoodfacts-nodejs`](https://github.com/openfoodfacts/openfoodfacts-js) with React Native helpers, hooks, and image-upload utilities.

Mobile apps can depend on this package for the shared chores all apps using Open Food Facts have to implement: product lookups, search, image uploads, barcode scanning integration, and more.

## Installation

```bash
npm install @openfoodfacts/react-native
# or
yarn add @openfoodfacts/react-native
```

### Peer dependencies

This package requires **React ≥ 18** and **React Native ≥ 0.72**.

## Quick start

### 1. Wrap your app in the provider

```tsx
import { OpenFoodFactsProvider } from "@openfoodfacts/react-native";

export default function App() {
  return (
    <OpenFoodFactsProvider country="world" language="en">
      <MyScreen />
    </OpenFoodFactsProvider>
  );
}
```

### 2. Use hooks in your components

```tsx
import { useProduct, useSearch } from "@openfoodfacts/react-native";
import { Text, ActivityIndicator } from "react-native";

function ProductCard({ barcode }: { barcode: string }) {
  const { data, loading, error } = useProduct(barcode);

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;
  if (!data) return <Text>Product not found</Text>;

  return <Text>{data.product?.product_name}</Text>;
}
```

### 3. Or use the client directly

```ts
import { createClient } from "@openfoodfacts/react-native";

const client = createClient({ country: "fr", language: "fr" });
const result = await client.getProductV2("3017620422003");
```

## API

### Client

| Export | Description |
|---|---|
| `createClient(options?)` | Create an `OpenFoodFacts` client pre-configured for React Native |
| `uploadImageFromUri(client, barcode, uri, imagefield)` | Upload an image from a local RN URI to a product |

### React Context

| Export | Description |
|---|---|
| `<OpenFoodFactsProvider>` | Provides an `OpenFoodFacts` client to descendant components |
| `OpenFoodFactsContext` | The raw React Context (for advanced use) |

### Hooks

| Hook | Description |
|---|---|
| `useOpenFoodFacts()` | Access the client from any component inside the provider |
| `useProduct(barcode)` | Fetch a product with loading/error state |
| `useSearch(query)` | Search products with loading/error state |

### Image utilities

| Export | Description |
|---|---|
| `createImageFile(uri, name?, type?)` | Create a React Native–compatible file descriptor from a local URI |
| `appendImageToForm(formData, fieldName, file)` | Append a RN image to a `FormData` instance |

### Re-exports from `@openfoodfacts/openfoodfacts-nodejs`

This package re-exports **everything** from the upstream SDK, so you don't need to add it as a separate dependency:

```ts
import {
  OpenFoodFacts,
  BackendType,
  // ... all types and classes
} from "@openfoodfacts/react-native";
```

This includes the `OpenFoodFacts` class, `BackendType` enum, all taxonomy types, search types, `Robotoff`, `PricesApi`, `Folksonomy`, `NutriPatrol`, and more.

## Supported platforms

| Platform | Status |
|---|---|
| Open Food Facts | ✅ (default) |
| Open Beauty Facts | ✅ `type: "OBF"` |
| Open Pet Food Facts | ✅ `type: "OPFF"` |
| Open Products Facts | ✅ `type: "OPF"` |

## Publishing

This package uses a **secure publishing pipeline**:

1. **CI** runs on every push/PR: lint → typecheck → test → build
2. **release-please** creates release PRs automatically from conventional commits
3. **npm publish** triggers on GitHub Release with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled

To publish, merge a release-please PR and then publish the GitHub Release.

### Required setup

- Create an **npm** environment in your repository settings
- Add an `NPM_TOKEN` secret with publish access to the `@openfoodfacts` scope

## 📚 Documentation

- [Open Food Facts API documentation](https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/)
- [openfoodfacts-js SDK documentation](https://openfoodfacts.github.io/openfoodfacts-js/)
- [JavaScript wiki page](https://wiki.openfoodfacts.org/API/Javascript)

## Legacy sample code

The original sample React Native screens (product editor, camera) have been moved to [`examples/legacy/`](examples/legacy/). They demonstrate how to integrate with Open Food Facts in a React Native app but are not part of the published package.

## 👩‍⚖️ License

The code is released under the [Apache 2.0 license](LICENSE).

## Contributing

Join the [Open Food Facts Slack](https://openfoodfacts.slack.com) (#javascript) if you'd like to contribute.

### Third party applications

Feel [free to open a PR to add your application in this list](https://github.com/openfoodfacts/openfoodfacts-react-native/edit/main/REUSERS.md).

Please get in touch at reuse@openfoodfacts.org. We are very interested in learning what the Open Food Facts data is used for. You can also fill [this form](https://forms.gle/hwaeqBfs8ywwhbTg8) to get a chance to get your app featured.

## ✏️ Authors and Contributors

- [EthicAdvisor](https://www.ethicadvisor.org) team
- Open Food Facts community
