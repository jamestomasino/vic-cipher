import { decodeVic, encodeVic } from "../core/index.js";

function getArg(flag: string, args: string[]): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) {
    return undefined;
  }
  return args[index + 1];
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
    "  vic encode --song <text> --mi <12345> --date <YYYY-MM-DD> --personal-id <0-16> --message <text>",
    "  vic decode --song <text> --date <YYYY-MM-DD> --personal-id <0-16> --code <digits>",
  ].join("\n");
}

function main(argv: string[]): number {
  const [cmd, ...args] = argv;

  try {
    if (cmd === "encode") {
      const out = encodeVic({
        song: getArg("--song", args) ?? "",
        mi: getArg("--mi", args) ?? "",
        date: parseDate(getArg("--date", args)),
        personalId: getArg("--personal-id", args) ?? "",
        message: getArg("--message", args) ?? "",
      });
      console.log(out);
      return 0;
    }

    if (cmd === "decode") {
      const out = decodeVic({
        song: getArg("--song", args) ?? "",
        date: parseDate(getArg("--date", args)),
        personalId: getArg("--personal-id", args) ?? "",
        code: getArg("--code", args) ?? "",
      });
      console.log(out);
      return 0;
    }

    console.error(usage());
    return 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    return 1;
  }
}

declare const process: { argv: string[]; exit(code: number): never };
process.exit(main(process.argv.slice(2)));
