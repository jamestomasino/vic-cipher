import { decodeVic, encodeVic } from "../core/index.ts";

function getArg(flag: string, args: string[]): string | undefined {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
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

function usage(): string {
  return [
    "Usage:",
    "  deno run -A src/cli-deno/mod.ts encode --song <text> --mi <12345> --date <YYYY-MM-DD> --personal-id <0-16> --message <text>",
    "  deno run -A src/cli-deno/mod.ts decode --song <text> --date <YYYY-MM-DD> --personal-id <0-16> --code <digits>",
  ].join("\n");
}

if (import.meta.main) {
  const [cmd, ...args] = Deno.args;

  try {
    if (cmd === "encode") {
      console.log(
        encodeVic({
          song: getArg("--song", args) ?? "",
          mi: getArg("--mi", args) ?? "",
          date: parseDate(getArg("--date", args)),
          personalId: getArg("--personal-id", args) ?? "",
          message: getArg("--message", args) ?? "",
        }),
      );
    } else if (cmd === "decode") {
      console.log(
        decodeVic({
          song: getArg("--song", args) ?? "",
          date: parseDate(getArg("--date", args)),
          personalId: getArg("--personal-id", args) ?? "",
          code: getArg("--code", args) ?? "",
        }),
      );
    } else {
      console.error(usage());
      Deno.exit(1);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    Deno.exit(1);
  }
}
