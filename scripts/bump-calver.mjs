import fs from "node:fs";

const packagePath = new URL("../package.json", import.meta.url);
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

const now = new Date();
const year = now.getUTCFullYear();
const month = now.getUTCMonth() + 1;

const match = String(pkg.version).match(/^(\d{4})\.(\d{1,2})\.(\d+)$/);
let patch = 0;
if (match) {
  const prevYear = Number(match[1]);
  const prevMonth = Number(match[2]);
  const prevPatch = Number(match[3]);
  patch = prevYear === year && prevMonth === month ? prevPatch + 1 : 0;
}

pkg.version = `${year}.${month}.${patch}`;
fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);

console.log(pkg.version);
