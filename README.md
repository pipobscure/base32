# 📦 @pipobscure/base32 — Simple TypeScript Base32 Encoder/Decoder

A lightweight, dependency-free Base32 encoder/decoder implemented in TypeScript with support for both synchronous and asynchronous streaming.

## ✨ Features

- 🔢 Encode and decode Base32 strings  
- ⚙️ Works directly with `Uint8Array`  
- 🚀 Synchronous and asynchronous streaming support  
- 🪶 Zero dependencies  
- 🧩 Fully typed for TypeScript  
- 🧠 Works in both **Node.js** and **browser environments**

## 🧰 Usage

### Basic Encoding & Decoding

```ts
import { encode, decode } from "@pipobscure/base32";

const data = new TextEncoder().encode("Hello world!");

// Encode to Base32
const encoded = encode(data);
console.log(encoded);
// → "nbswy3dpeb3w64tmmq"

// Decode back to bytes
const decoded = decode(encoded);
console.log(new TextDecoder().decode(decoded));
// → "Hello world!"
```

### Streaming (Synchronous)

```ts
import { encodeIterable, decodeIterable } from "@pipobscure/base32";

const chunks = [
  new TextEncoder().encode("Hello "),
  new TextEncoder().encode("world!")
];

// Encode in chunks
const encodedChunks = Array.from(encodeIterable(chunks)).join("");
console.log(encodedChunks);

// Decode in chunks
const decodedChunks = Array.from(decodeIterable([encodedChunks]));
const decodedData = Uint8Array.from(decodedChunks.flat());
console.log(new TextDecoder().decode(decodedData));
```

### Asynchronous Streaming

For large or lazy data sources like network responses or file streams, you can use async generators.

```ts
import { encodeAsyncIterable, decodeAsyncIterable } from "@pipobscure/base32";

async function* readChunks() {
  yield new TextEncoder().encode("Hello ");
  await new Promise(r => setTimeout(r, 10)); // simulate async source
  yield new TextEncoder().encode("world!");
}

// Encode asynchronously
let encoded = "";
for await (const part of encodeAsyncIterable(readChunks())) {
  encoded += part;
}
console.log(encoded);

// Decode asynchronously
let decoded = new Uint8Array();
for await (const chunk of decodeAsyncIterable([encoded])) {
  decoded = new Uint8Array([...decoded, ...chunk]);
}
console.log(new TextDecoder().decode(decoded));
// → "Hello world!"
```

## ⚙️ API Reference

### `encode(data: Uint8Array): string`
Encodes a `Uint8Array` into a Base32 string.

### `decode(data: string): Uint8Array`
Decodes a Base32 string into a `Uint8Array`.

### `encodeIterable(chunks: Iterable<Uint8Array>): Iterable<string>`
Encodes data from a synchronous iterable source into Base32 segments.  
Ideal for processing static data in chunks.

### `decodeIterable(parts: Iterable<string>): Iterable<Uint8Array>`
Decodes Base32 segments from a synchronous iterable source.

### `encodeAsyncIterable(chunks: AsyncIterable<Uint8Array>): AsyncIterable<string>`
Encodes data from an **asynchronous** iterable source into Base32-encoded chunks.  
Perfect for file streams, network data, or any async producer.

### `decodeAsyncIterable(parts: AsyncIterable<string>): AsyncIterable<Uint8Array>`
Decodes Base32 data from an **asynchronous** iterable source into decoded byte chunks.

## 🧑‍💻 TypeScript Support

Written entirely in TypeScript with comprehensive type definitions—no need for extra `@types` packages.

## 📄 License

© 2025 Philipp Dunkel <pip@pipobscure.com> [EUPL v1.2](https://eupl.eu/1.2/en)
