import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { deriveIntermediateKeys } from '../dist/src/core/index.js';

const vectorsPath = path.resolve(process.cwd(), 'test-vectors/public-vic-vectors.json');
const vectors = JSON.parse(fs.readFileSync(vectorsPath, 'utf8'));

test('public vector: key-schedule example from VIC worked example', () => {
  const { song, mi, date, personalId, expected } = vectors.vectors.key_schedule_example;
  const keys = deriveIntermediateKeys(song, mi, new Date(`${date}T00:00:00Z`), personalId);

  assert.equal(keys.s1.join(''), expected.s1);
  assert.equal(keys.s2.join(''), expected.s2);
  assert.equal(keys.date.join(''), expected.date);
  assert.equal(keys.g.join(''), expected.g);
  assert.equal(keys.t.join(''), expected.t);
  assert.deepEqual(keys.u.map((row) => row.join('')), expected.u);
  assert.equal(keys.firstTrans, expected.firstTrans);
  assert.equal(keys.secondTrans, expected.secondTrans);
});
