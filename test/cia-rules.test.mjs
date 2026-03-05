import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { subtractDigits } from '../dist/src/core/digitMath.js';
import { generateLaggedFibonacci } from '../dist/src/core/laggedFibonacci.js';
import { sequentialSubstitute } from '../dist/src/core/sequentialSubstitution.js';

const vectorsPath = path.resolve(process.cwd(), 'test-vectors/public-vic-vectors.json');
const vectors = JSON.parse(fs.readFileSync(vectorsPath, 'utf8')).vectors;

test('CIA docs rule: chain addition example', () => {
  const { seed, length, expected } = vectors.chain_addition;
  assert.deepEqual(generateLaggedFibonacci(seed, length), expected);
});

test('CIA docs rule: sequentialization example', () => {
  const { input, expected } = vectors.sequentialization;
  assert.deepEqual(sequentialSubstitute(input), expected);
});

test('CIA docs rule: keygroup minus date first five (mod 10, no borrowing)', () => {
  const { messageId, dateFirstFive, expectedMod10Difference } = vectors.cia_keygroup_subtraction_example;
  assert.deepEqual(subtractDigits(messageId, dateFirstFive), expectedMod10Difference);
});
