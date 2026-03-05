# VIC Cipher Utility Spec (v1)

This implementation follows a fixed v1 profile derived from public VIC documentation and verified vectors.

## Inputs
- `song`: at least 20 alphanumeric characters after normalization
- `mi`: 5-digit message identifier (encode)
- `date`: JavaScript `Date`
- `personalId`: integer `0..16`
- `message`: characters `A-Z`, `0-9`, `.` after normalization

## Key Schedule
1. Normalize `song` to uppercase alphanumerics.
2. Take first 10 chars -> `s1` and next 10 chars -> `s2`.
3. Sequentially substitute each to digits (`1..9,0`).
4. Build date digits as `day + month + fullYear`, then take first 5 digits.
5. Compute `mi - date` without borrowing.
6. Expand to 10 via chain addition (lagged Fibonacci mod 10).
7. Add to `s1` without carry to produce `g`.
8. Map each digit of `g` through `s2` to produce `t`.
9. Expand `t` to 60 by chain addition, and use digits 11..60 as a 5x10 `u` block.
10. Compute transposition widths from final row of `u` and `personalId`.
11. Build `k1`, `k2` from sequentialized columns of `u`.
12. Build checkerboard headers `c` by sequentializing last row of `u`.

## Encode
1. Build checkerboard from `c` + fixed rows.
2. Encode normalized message via checkerboard.
3. Pad checkerboard output to multiple of 5 (default behavior).
4. Apply simple columnar transposition with `k1`.
5. Apply disrupted transposition with `k2`.
6. Insert `mi` based on final year digit rule from AS3.
7. Output grouped in 5-digit blocks.

## Decode
1. Strip non-digits from input code.
2. Extract `mi` using final year digit rule.
3. Recompute key schedule with extracted `mi`.
4. Reverse disrupted transposition with `k2`.
5. Reverse simple columnar transposition with `k1`.
6. Decode checkerboard output to plaintext.

## Security Note
VIC is historical and should not be used for modern cryptographic security.
