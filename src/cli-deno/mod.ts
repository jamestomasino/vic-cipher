import { decodeVic, encodeVic } from "../core/index.ts";

function getArg(flag: string, args: string[]): string | undefined {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
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

async function readStdin(): Promise<string> {
  if (stdinCache != null) {
    return stdinCache;
  }
  stdinCache = await new Response(Deno.stdin.readable).text();
  return stdinCache;
}

async function resolveStdInValues(values: Record<string, string | undefined>): Promise<Record<string, string | undefined>> {
  const stdinKeys = Object.entries(values)
    .filter(([, value]) => value === "-")
    .map(([key]) => key);

  if (stdinKeys.length > 1) {
    throw new Error(`Only one input can be read from stdin, but got: ${stdinKeys.join(", ")}`);
  }

  if (stdinKeys.length === 1) {
    values[stdinKeys[0]] = await readStdin();
  }

  return values;
}

function usage(): string {
  return [
    "Usage:",
    "  deno run -A src/cli-deno/mod.ts encode --song <text|-> --mi <12345> --date <YYYY-MM-DD> --personal-id <0-16> --message <text|-> [--strict] [--json]",
    "  deno run -A src/cli-deno/mod.ts decode --song <text|-> --date <YYYY-MM-DD> --personal-id <0-16> --code <digits|-> [--strict] [--json]",
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

async function main(argv: string[]): Promise<number> {
  const [cmd, ...args] = argv;
  const jsonMode = hasFlag("--json", args);
  const strict = hasFlag("--strict", args);

  if (cmd === "encode") {
    const values = await resolveStdInValues({
      song: getArg("--song", args),
      mi: getArg("--mi", args),
      date: getArg("--date", args),
      personalId: getArg("--personal-id", args),
      message: getArg("--message", args),
    });

    const result = encodeVic({
      song: values.song ?? "",
      mi: values.mi ?? "",
      date: parseDate(values.date),
      personalId: values.personalId ?? "",
      message: values.message ?? "",
      strict,
    });
    printResult(jsonMode, { ok: true, mode: "encode", result });
    return 0;
  }

  if (cmd === "decode") {
    const values = await resolveStdInValues({
      song: getArg("--song", args),
      date: getArg("--date", args),
      personalId: getArg("--personal-id", args),
      code: getArg("--code", args),
    });

    const result = decodeVic({
      song: values.song ?? "",
      date: parseDate(values.date),
      personalId: values.personalId ?? "",
      code: values.code ?? "",
      strict,
    });

    printResult(jsonMode, { ok: true, mode: "decode", result });
    return 0;
  }

  printError(jsonMode, usage());
  return 1;
}

if (import.meta.main) {
  try {
    Deno.exit(await main(Deno.args));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    printError(Deno.args.includes("--json"), message);
    Deno.exit(1);
  }
}
