function leftPadWithZeros(arr: number[], targetLength: number): number[] {
  if (arr.length >= targetLength) {
    return arr;
  }
  return Array(targetLength - arr.length).fill(0).concat(arr);
}

function sameLength(a1: number[], a2: number[]): [number[], number[]] {
  const maxLen = Math.max(a1.length, a2.length);
  return [leftPadWithZeros(a1, maxLen), leftPadWithZeros(a2, maxLen)];
}

export function sumDigits(a1: number[], a2: number[]): number[] {
  const [left, right] = sameLength(a1, a2);
  return left.map((n, i) => (n + right[i]) % 10);
}

export function subtractDigits(a1: number[], a2: number[]): number[] {
  const [left, right] = sameLength(a1, a2);
  return left.map((n, i) => {
    const value = (n - right[i]) % 10;
    return value < 0 ? value + 10 : value;
  });
}
