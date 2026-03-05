export function generateLaggedFibonacci(source: number[], length: number): number[] {
  const out = source.slice();
  if (length <= out.length) {
    return out.slice(0, length);
  }

  let fibIndex = 0;
  for (let i = out.length; i < length; i += 1) {
    const num1 = Number(out[fibIndex] ?? 0);
    const num2 = Number(out[fibIndex + 1] ?? 0);
    out.push((num1 + num2) % 10);
    fibIndex += 1;
  }
  return out;
}
