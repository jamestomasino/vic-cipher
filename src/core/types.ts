export interface VicEncodeInput {
  song: string;
  mi: string;
  date: Date;
  personalId: string | number;
  message: string;
  paddingMultiple?: number;
  random?: () => number;
  strict?: boolean;
}

export interface VicDecodeInput {
  song: string;
  date: Date;
  personalId: string | number;
  code: string;
  strict?: boolean;
}

export interface VicIntermediateKeys {
  s1: number[];
  s2: number[];
  mi: number[];
  date: number[];
  g: number[];
  t: number[];
  u: number[][];
  c: number[];
  firstTrans: number;
  secondTrans: number;
  k1: number[];
  k2: number[];
}

export interface VicValidationResult {
  ok: boolean;
  errors: string[];
}
