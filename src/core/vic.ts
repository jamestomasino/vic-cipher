import { KEY_A_SIN_TO_ERR, ROW_2, ROW_3 } from "./constants.js";
import { subtractDigits, sumDigits } from "./digitMath.js";
import { VicInputError } from "./errors.js";
import { generateLaggedFibonacci } from "./laggedFibonacci.js";
import { sequentialSubstitute, sequentialSubstituteIntegers } from "./sequentialSubstitution.js";
import { StraddlingCheckerboard } from "./straddlingCheckerboard.js";
import { disrupted, simpleColumn, undisrupted, unSimpleColumn } from "./transposition.js";
import type { VicDecodeInput, VicEncodeInput, VicIntermediateKeys } from "./types.js";
import { validateDecodeInput, validateEncodeInput } from "./validate.js";

function digits(input: string): number[] {
  return input.split("").map((char) => Number(char));
}

function normalizeSong(song: string): string {
  return song.toUpperCase().replace(/[^A-Za-z0-9]/g, "");
}

function normalizeCode(code: string): string {
  return code.replace(/[^0-9]/g, "");
}

function formatFiveGroups(chars: string[]): string {
  const out = chars.slice();
  for (let i = 5; i < out.length; i += 6) {
    out.splice(i, 0, " ");
  }
  return out.join("");
}

function keyDateDigits(date: Date): number[] {
  // Preserves the AS3 behavior intentionally: day + month + fullYear without zero-padding.
  const dateString = `${date.getUTCDate()}${date.getUTCMonth() + 1}${date.getUTCFullYear()}`;
  return digits(dateString).slice(0, 5);
}

function yearLastDigit(date: Date): number {
  const year = String(date.getUTCFullYear());
  const value = Number(year.slice(-1));
  return value === 0 ? 10 : value;
}

export function deriveIntermediateKeys(song: string, mi: string, date: Date, personalId: string | number): VicIntermediateKeys {
  const normalizedSong = normalizeSong(song);
  const songArr = normalizedSong.split("");
  const s1 = sequentialSubstitute(songArr.slice(0, 10));
  const s2 = sequentialSubstitute(songArr.slice(10, 20));

  const miDigits = digits(mi).slice(0, 5);
  const dateDigits = keyDateDigits(date);

  const miDateDiff = generateLaggedFibonacci(subtractDigits(miDigits, dateDigits), 10);
  const g = sumDigits(s1, miDateDiff);

  // Locate each G digit in 1234567890 and copy digit directly above it from S2.
  // Digit 0 corresponds to position 10.
  const t = g.map((digit) => s2[digit === 0 ? 9 : digit - 1]);

  const uSource = generateLaggedFibonacci(t.slice(), 60);
  const u: number[][] = [];
  for (let i = 0; i < 5; i += 1) {
    const sliceIndex = 10 * (i + 1);
    u[i] = uSource.slice(sliceIndex, sliceIndex + 10);
  }

  const pid = Number(personalId);
  if (pid > 16) {
    throw new VicInputError("personalId cannot exceed 16");
  }

  const secondTrans = pid + u[4][9];
  let firstTrans = pid;
  for (let i = 8; i >= 0; i -= 1) {
    if (u[4][9] !== u[4][i]) {
      firstTrans = pid + u[4][i];
      break;
    }
  }

  const seqT = sequentialSubstituteIntegers(t);
  const columnU: number[] = [];

  for (let i = 1; i <= 10; i += 1) {
    const columnIndex = seqT.indexOf(i % 10);
    for (let j = 0; j < u.length; j += 1) {
      columnU.push(u[j][columnIndex]);
    }
  }

  const k1 = sequentialSubstituteIntegers(columnU.slice(0, firstTrans), false);
  const k2 = sequentialSubstituteIntegers(columnU.slice(firstTrans, firstTrans + secondTrans), false);

  const c = sequentialSubstitute(u[4]);

  return {
    s1,
    s2,
    mi: miDigits,
    date: dateDigits,
    g,
    t,
    u,
    c,
    firstTrans,
    secondTrans,
    k1,
    k2,
  };
}

function buildCheckerboard(c: number[]): StraddlingCheckerboard {
  const table: Array<string | number> = [];
  table.push(...c);
  table.push(...KEY_A_SIN_TO_ERR);
  table.push(...ROW_2);
  table.push(...ROW_3);
  return new StraddlingCheckerboard(table);
}

export function encodeVic(input: VicEncodeInput): string {
  const validation = validateEncodeInput(input.song, input.message, input.mi, input.personalId, input.date);
  if (!validation.ok) {
    throw new VicInputError(validation.errors.join(" "));
  }

  const keys = deriveIntermediateKeys(input.song, input.mi, input.date, input.personalId);
  const checkerboard = buildCheckerboard(keys.c);

  const straddled = checkerboard.encode(input.message, input.paddingMultiple ?? 5, input.random);
  const first = simpleColumn(straddled.split(""), keys.k1);
  const second = disrupted(first, keys.k2);

  const miIndexDigit = yearLastDigit(input.date);
  const miIndex = second.length - (5 * (miIndexDigit - 1));
  const withMi = second.slice();
  const end = withMi.splice(miIndex);
  withMi.push(...input.mi.split(""), ...end);

  return formatFiveGroups(withMi);
}

export function decodeVic(input: VicDecodeInput): string {
  const validation = validateDecodeInput(input.song, input.code, input.personalId, input.date);
  if (!validation.ok) {
    throw new VicInputError(validation.errors.join(" "));
  }

  const codeArr = normalizeCode(input.code).split("");
  const codeLen = codeArr.length;

  const miIndexDigit = yearLastDigit(input.date);
  const miIndex = codeLen - (5 * miIndexDigit);
  const mi = codeArr.splice(miIndex, 5).join("");

  const keys = deriveIntermediateKeys(input.song, mi, input.date, input.personalId);
  const checkerboard = buildCheckerboard(keys.c);

  const first = undisrupted(codeArr, keys.k2);
  const unstraddled = unSimpleColumn(first, keys.k1);

  return checkerboard.decode(unstraddled.join(""));
}
