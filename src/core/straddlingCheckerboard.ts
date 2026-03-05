const NUMERALS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const HIGH_FREQUENCY = ["E", "S", "T", "O", "N", "I", "A", "R"];
const LOW_FREQUENCY = ["B", "C", "D", "F", "G", "H", "J", "K", "L", "M", "P", "Q", "U", "V", "W", "X", "Y", "Z", "#", "."];

interface BoardState {
  row1: string[];
  row2: string[];
  row3: string[];
  row4: string[];
  row3Key: string;
  row4Key: string;
  escapeKey: string;
}

export class StraddlingCheckerboard {
  private readonly state: BoardState;

  private readonly encodeTable: Record<string, string>;

  constructor(tableArray: Array<string | number>) {
    const normalized = tableArray.map((item) => String(item));
    this.state = this.createState(normalized);
    this.encodeTable = this.createEncodeTable(this.state);
  }

  encode(unencodedMessage: string, mod = 1, random: () => number = Math.random): string {
    const message = unencodedMessage.toUpperCase().replace(/[^A-Z0-9\.]/g, "");
    let out = "";
    for (const char of message) {
      const code = this.encodeTable[char];
      if (code != null) {
        out += code;
      }
    }

    let padding = out.length % mod;
    if (padding) {
      padding = mod - padding;
    }

    for (let i = 0; i < padding; i += 1) {
      const pick = HIGH_FREQUENCY[Math.floor(random() * HIGH_FREQUENCY.length)];
      out += this.encodeTable[pick];
    }

    return out;
  }

  decode(encodedMessage: string): string {
    const { row1, row2, row3, row4 } = this.state;
    let result = "";
    let pos = 0;

    while (pos < encodedMessage.length) {
      const numberIdx = `${encodedMessage.charAt(pos)}${encodedMessage.charAt(pos + 1)}${encodedMessage.charAt(pos + 2)}`;
      const current = encodedMessage.charAt(pos);

      if (current !== row4[0] && current !== row3[0]) {
        result += row2[row1.indexOf(current)] ?? "";
        pos += 1;
      } else if (row3[0] === current && row3[row1.indexOf(encodedMessage.charAt(pos + 1))] === "#") {
        result += this.decodeNumbers(numberIdx);
        pos += 3;
      } else if (row4[0] === current && row4[row1.indexOf(encodedMessage.charAt(pos + 1))] === "#") {
        result += this.decodeNumbers(numberIdx);
        pos += 3;
      } else if (row3[0] === current) {
        result += row3[row1.indexOf(encodedMessage.charAt(pos + 1))] ?? "";
        pos += 2;
      } else if (row4[0] === current) {
        result += row4[row1.indexOf(encodedMessage.charAt(pos + 1))] ?? "";
        pos += 2;
      } else {
        pos += 1;
      }
    }

    return result;
  }

  private decodeNumbers(idx: string): string {
    for (const [key, value] of Object.entries(this.encodeTable)) {
      if (value === idx) {
        return key;
      }
    }
    return "";
  }

  private createState(tableArray: string[]): BoardState {
    const row1 = tableArray.slice(0, 10);
    const row2 = tableArray.slice(10, 20);
    const row3 = tableArray.slice(20, 30);
    const row4 = tableArray.slice(30, 40);

    const blankIndex1 = row2.indexOf(" ", 0);
    const blankIndex2 = row2.indexOf(" ", blankIndex1 + 1);

    const row3Key = row1[blankIndex1];
    const row4Key = row1[blankIndex2];

    row1.unshift(" ");
    row2.unshift(" ");
    row3.unshift(row3Key);
    row4.unshift(row4Key);

    const numberIndex = row3.includes("#") ? row3.indexOf("#") : row4.indexOf("#");
    const escapeKey = row3.includes("#")
      ? `${row3Key}${row1[numberIndex]}`
      : `${row4Key}${row1[numberIndex]}`;

    return {
      row1,
      row2,
      row3,
      row4,
      row3Key,
      row4Key,
      escapeKey,
    };
  }

  private createEncodeTable(state: BoardState): Record<string, string> {
    const { row1, row2, row3, row4, row3Key, row4Key, escapeKey } = state;
    const table: Record<string, string> = {};

    for (const num of NUMERALS) {
      const suffix = String(row1.indexOf(num) - 1);
      table[num] = `${escapeKey}${suffix}`;
    }

    for (const char of HIGH_FREQUENCY) {
      const index = row2.indexOf(char);
      table[char] = row1[index];
    }

    for (const char of LOW_FREQUENCY) {
      if (row3.includes(char)) {
        const index = row3.indexOf(char);
        table[char] = `${row3Key}${row1[index]}`;
      } else {
        const index = row4.indexOf(char);
        table[char] = `${row4Key}${row1[index]}`;
      }
    }

    return table;
  }
}
