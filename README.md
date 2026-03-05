# vic-cipher

TypeScript VIC-cipher library and CLI for Node.js, with Deno compatibility.

## Security Notice
VIC is a historical cipher and is **not secure for modern cryptographic use**.
Use this project for historical research, education, and interoperability testing.

## Highlights
- Shared TypeScript core for encode/decode and intermediate-key derivation
- Node CLI (`vic encode`, `vic decode`)
- Deno-compatible CLI and npm package usage
- JSON output mode for automation
- Stdin pipeline mode (`-` placeholders)
- Optional strict mode to reject lossy normalization
- Public documentation vectors (CIA/Wikipedia mechanics)

## Install

### CLI
```bash
npm install -g vic-cipher
```

### Library
```bash
npm install vic-cipher
```

## CLI Usage (Node)

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

### JSON Mode
```bash
vic encode ... --json
```
Outputs:
```json
{"ok":true,"mode":"encode","result":"..."}
```

### Strict Mode
```bash
vic encode ... --strict
vic decode ... --strict
```
- Encode strict mode rejects message input if normalization would drop characters.
- Decode strict mode rejects non-digit noise (whitespace formatting is allowed).

### Stdin Pipeline Mode
Use `-` to read exactly one argument value from stdin:
```bash
echo "HELLO123" | vic encode \
  --song "When I find myself in times of trouble mother mary comes to me" \
  --mi 12345 \
  --date 1752-09-03 \
  --personal-id 7 \
  --message -
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
  strict: false,
});

const decoded = decodeVic({
  song: "When I find myself in times of trouble mother mary comes to me",
  date: new Date("1752-09-03"),
  personalId: 7,
  code: encoded,
  strict: false,
});

const keys = deriveIntermediateKeys(
  "When I find myself in times of trouble mother mary comes to me",
  "12345",
  new Date("1752-09-03"),
  7,
);
```

### Input Rules
- `song`: at least 20 alphanumeric chars after normalization
- `mi`: exactly 5 digits (encode)
- `date`: valid JavaScript `Date`
- `personalId`: integer `0..16`
- `message`: normalized to `A-Z`, `0-9`, `.`
- `code`: decode strips non-digits unless strict mode rejects invalid noise

## Deno Usage

### Import from npm in Deno
```ts
import { encodeVic } from "npm:vic-cipher";
```

### Run CLI through npm package in Deno
```bash
deno run -A npm:vic-cipher encode \
  --song "When I find myself in times of trouble mother mary comes to me" \
  --mi 12345 \
  --date 1752-09-03 \
  --personal-id 7 \
  --message HELLO123
```

### Native Deno entrypoint (repo usage)
```bash
deno task vic encode --song "..." --mi 12345 --date 1752-09-03 --personal-id 7 --message "..."
```

## Development

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

## Testing Strategy
- Stage tests for arithmetic and transposition primitives
- End-to-end encode/decode round-trip tests
- Public documented-rule vectors:
  - chain addition
  - sequentialization
  - mod-10 subtraction without borrowing
  - worked key-schedule values

Fixtures live in `test-vectors/`.

## Release and Versioning (CalVer)
This project uses **CalVer**: `YYYY.M.PATCH` (UTC).
Examples:
- `2026.3.0`
- `2026.3.1`
- `2026.4.0`

### Bump version
```bash
npm run calver:bump
```
- Same year/month: increments patch
- New month: resets patch to `0`

## npm Publish Checklist
1. `npm install`
2. `npm test`
3. `npm pack` (inspect package contents)
4. `npm publish --access public`

## CI
GitHub Actions workflow runs:
- Node matrix tests (Node 20 and 22)
- Deno type check and CLI smoke run

## Sources
- CIA: Number One From Moscow: https://www.cia.gov/resources/csi/static/Number-One-From-Moscow.pdf
- Wikipedia VIC cipher: https://en.wikipedia.org/wiki/VIC_cipher
