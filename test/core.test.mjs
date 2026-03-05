import test from 'node:test';
import assert from 'node:assert/strict';

import { encodeVic, decodeVic, deriveIntermediateKeys } from '../dist/src/core/index.js';
import { simpleColumn, unSimpleColumn, disrupted, undisrupted } from '../dist/src/core/transposition.js';

const song = 'When I find myself in times of trouble mother mary comes to me';
const date = new Date('1752-09-03');

function normalizeMessage(message) {
  return message.toUpperCase().replace(/[^A-Z0-9.]/g, '');
}

test('transposition simple/disrupted inverses hold', () => {
  const source = '0123456789012345678901234'.split('');
  const columnsA = [4, 1, 7, 3, 2, 6, 5];
  const columnsB = [8, 1, 3, 7, 2, 5, 4, 6];

  const simple = simpleColumn(source, columnsA);
  assert.deepEqual(unSimpleColumn(simple, columnsA), source);

  const dis = disrupted(source, columnsB);
  assert.deepEqual(undisrupted(dis, columnsB), source);
});

test('full vic encode/decode roundtrip without padding', () => {
  const encoded = encodeVic({
    song,
    mi: '12345',
    date,
    personalId: '7',
    message: 'Meet at 9. Bring map.',
    paddingMultiple: 1,
  });

  const decoded = decodeVic({
    song,
    date,
    personalId: '7',
    code: encoded,
  });

  assert.equal(decoded, normalizeMessage('Meet at 9. Bring map.'));
});

test('intermediate keys are deterministic for fixed inputs', () => {
  const keys1 = deriveIntermediateKeys(song, '54321', date, 5);
  const keys2 = deriveIntermediateKeys(song, '54321', date, 5);

  assert.deepEqual(keys1, keys2);
  assert.equal(keys1.c.length, 10);
  assert.equal(keys1.k1.length, keys1.firstTrans);
  assert.equal(keys1.k2.length, keys1.secondTrans);
});
