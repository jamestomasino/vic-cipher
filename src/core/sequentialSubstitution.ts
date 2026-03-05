function sortableString(value: string | number): string {
  return String(value);
}

export function sequentialSubstitute(source: Array<string | number>, mod10 = true): number[] {
  const lookup = source.slice();
  const sorted = source.slice().sort((a, b) => sortableString(a).localeCompare(sortableString(b)));

  const out: number[] = new Array(source.length);
  for (let index = 0; index < sorted.length; index += 1) {
    const item = sorted[index];
    const itemIndex = lookup.indexOf(item);
    lookup[itemIndex] = Symbol("used") as unknown as string | number;

    let placeValue = index + 1;
    if (mod10) {
      placeValue %= 10;
    }
    out[itemIndex] = placeValue;
  }

  return out;
}

export function sequentialSubstituteIntegers(source: number[], mod10 = true): number[] {
  const transformed = source.map((digit) => {
    if (digit === 0) {
      return "10";
    }
    if (digit < 10) {
      return `0${digit}`;
    }
    return String(digit);
  });
  return sequentialSubstitute(transformed, mod10);
}
