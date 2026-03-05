# vic-cipher

TypeScript VIC-cipher library and CLI for Node.js, with Deno usage via npm compatibility.

## Security Notice
VIC is a historical cipher and is **not secure for modern cryptographic use**.
This package is for research, education, and interoperability with historical documentation.

## Features
- VIC encode/decode pipeline implemented in TypeScript
- Shared core logic (`encodeVic`, `decodeVic`, `deriveIntermediateKeys`)
- Node CLI (`vic encode`, `vic decode`)
- Public-vector tests based on CIA/Wikipedia documented mechanics
- Deterministic and stage-level tests to catch symmetric encode/decode bugs

## Install

### As a CLI (global)
```bash
npm install -g vic-cipher
```

### As a library
```bash
npm install vic-cipher
```

## Quick Start (Node CLI)

### Encode
```bash
vic encode \
  --song "When I find myself in times of trouble mother mary comes to me" \
  --mi 12345 \
  --date 1752-09-03 \
  --personal-id 7 \
  --message "Meet at 9. Bring map."
```

### Decode
```bash
vic decode \
  --song "When I find myself in times of trouble mother mary comes to me" \
  --date 1752-09-03 \
  --personal-id 7 \
  --code "60377 31953 34771 79034 11234 57102 6"
```

## Library API

```ts
import { encodeVic, decodeVic, deriveIntermediateKeys } from "vic-cipher";

const encoded = encodeVic({
  song: "When I find myself in times of trouble mother mary comes to me",
  mi: "12345",
  date: new Date("1752-09-03"),
  personalId: 7,
  message: "Meet at 9. Bring map.",
});

const decoded = decodeVic({
  song: "When I find myself in times of trouble mother mary comes to me",
  date: new Date("1752-09-03"),
  personalId: 7,
  code: encoded,
});

const keys = deriveIntermediateKeys(
  "When I find myself in times of trouble mother mary comes to me",
  "12345",
  new Date("1752-09-03"),
  7,
);
```

### Input Model
- `song`: at least 20 alphanumeric chars after normalization
- `mi`: exactly 5 digits (encode)
- `date`: JavaScript `Date`
- `personalId`: integer from `0` to `16`
- `message`: `A-Z`, `0-9`, `.` (after normalization)
- `code`: digits (non-digits stripped on decode)

## Deno Usage
Deno can consume the npm package directly.

### Library usage in Deno
```ts
import { encodeVic } from "npm:vic-cipher";

const code = encodeVic({
  song: "When I find myself in times of trouble mother mary comes to me",
  mi: "12345",
  date: new Date("1752-09-03"),
  personalId: 7,
  message: "HELLO123",
});
console.log(code);
```

### CLI usage in Deno
```bash
deno run -A npm:vic-cipher encode \
  --song "When I find myself in times of trouble mother mary comes to me" \
  --mi 12345 \
  --date 1752-09-03 \
  --personal-id 7 \
  --message "HELLO123"
```

## Local Development

### Setup
```bash
npm install
```

### Build
```bash
npm run build
```

### Test
```bash
npm test
```

## Test Coverage Approach
- Core transposition inversion tests
- End-to-end encode/decode round-trip tests
- Public rule vectors from historical documentation:
  - Chain addition
  - Sequentialization
  - Modular subtraction without borrowing
  - Worked key-schedule example

Vector fixtures live in `test-vectors/`.

## Algorithm Profile and Compatibility
This project follows a fixed v1 profile and matches documented VIC mechanics with profile-specific choices captured in `docs/spec-v1.md`.

Notable profile choices:
- Date digit derivation from JS `Date` day/month/year string behavior
- Checkerboard construction constants in the implementation profile
- MI insertion logic in the implementation profile

## Publish Checklist (npm)
1. `npm install`
2. `npm test`
3. `npm pack` (inspect package contents)
4. `npm publish --access public`

## What Is Left for “Fully Featured”
- Add strict, manually verified CIA Figure 3 golden ciphertext fixture
- Add JSON I/O mode for CLI (`--json`)
- Add stdin/stdout pipeline mode for CLI
- Add optional strict mode that rejects lossy normalization
- Add CI matrix (Node + Deno runtime checks)
- Add semver release automation (tags/changelog)

## Sources
- CIA: Number One From Moscow: https://www.cia.gov/resources/csi/static/Number-One-From-Moscow.pdf
- Wikipedia VIC cipher: https://en.wikipedia.org/wiki/VIC_cipher
