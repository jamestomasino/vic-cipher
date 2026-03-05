import fs from "node:fs";

import { decodeVic, encodeVic } from "../core/index.js";

function getArg(flag: string, args: string[]): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) {
    return undefined;
  }
  return args[index + 1];
}

function hasFlag(flag: string, args: string[]): boolean {
  return args.includes(flag);
}

function parseDate(raw: string | undefined): Date {
  if (!raw) {
    throw new Error("Missing --date (use YYYY-MM-DD)");
  }
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid --date value: ${raw}`);
  }
  return d;
}

let stdinCache: string | undefined;

function readStdin(): string {
  if (stdinCache != null) {
    return stdinCache;
  }
  stdinCache = fs.readFileSync(0, "utf8");
  return stdinCache;
}

function resolveStdInValues(values: Record<string, string | undefined>): Record<string, string | undefined> {
  const stdinKeys = Object.entries(values)
    .filter(([, value]) => value === "-")
    .map(([key]) => key);

  if (stdinKeys.length > 1) {
    throw new Error(`Only one input can be read from stdin, but got: ${stdinKeys.join(", ")}`);
  }

  if (stdinKeys.length === 1) {
    const key = stdinKeys[0];
    values[key] = readStdin();
  }

  return values;
}

function usage(): string {
  return [
    "Usage:",
    "  vic encode --song <text|-> --mi <12345> --date <YYYY-MM-DD> --personal-id <0-16> --message <text|-> [--strict] [--json]",
    "  vic decode --song <text|-> --date <YYYY-MM-DD> --personal-id <0-16> --code <digits|-> [--strict] [--json]",
    "",
    "Notes:",
    "  Use '-' for --song, --message, or --code to read that single field from stdin.",
  ].join("\n");
}

function printResult(jsonMode: boolean, payload: Record<string, unknown>): void {
  if (jsonMode) {
    console.log(JSON.stringify(payload));
    return;
  }
  if (typeof payload.result === "string") {
    console.log(payload.result);
  }
}

function printError(jsonMode: boolean, message: string): void {
  if (jsonMode) {
    console.error(JSON.stringify({ ok: false, error: message }));
    return;
  }
  console.error(message);
}

function main(argv: string[]): number {
  const [cmd, ...args] = argv;
  const jsonMode = hasFlag("--json", args);
  const strict = hasFlag("--strict", args);

  try {
    if (cmd === "encode") {
      const values = resolveStdInValues({
        song: getArg("--song", args),
        mi: getArg("--mi", args),
        date: getArg("--date", args),
        personalId: getArg("--personal-id", args),
        message: getArg("--message", args),
      });

      const out = encodeVic({
        song: values.song ?? "",
        mi: values.mi ?? "",
        date: parseDate(values.date),
        personalId: values.personalId ?? "",
        message: values.message ?? "",
        strict,
      });

      printResult(jsonMode, { ok: true, mode: "encode", result: out });
      return 0;
    }

    if (cmd === "decode") {
      const values = resolveStdInValues({
        song: getArg("--song", args),
        date: getArg("--date", args),
        personalId: getArg("--personal-id", args),
        code: getArg("--code", args),
      });

      const out = decodeVic({
        song: values.song ?? "",
        date: parseDate(values.date),
        personalId: values.personalId ?? "",
        code: values.code ?? "",
        strict,
      });

      printResult(jsonMode, { ok: true, mode: "decode", result: out });
      return 0;
    }

    printError(jsonMode, usage());
    return 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    printError(jsonMode, message);
    return 1;
  }
}

declare const process: { argv: string[]; exit(code: number): never };
process.exit(main(process.argv.slice(2)));
