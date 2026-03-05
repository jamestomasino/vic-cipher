interface Point {
  x: number;
  y: number;
}

function toColumnStrings(columns: number[]): string[] {
  return columns.map((value) => (value < 10 ? `0${value}` : String(value)));
}

function flattenByColumns(matrix: string[][], columns: string[]): string[] {
  const out: string[] = [];
  const columnsSorted = columns.slice().sort();

  for (const columnValue of columnsSorted) {
    const columnNum = columns.indexOf(columnValue);
    for (let row = 0; row < matrix.length; row += 1) {
      if (matrix[row].length > columnNum) {
        out.push(matrix[row][columnNum]);
      }
    }
  }

  return out;
}

function unflattenToColumns(source: string[], columns: string[]): string[][] {
  const sourceLen = source.length;
  const colLen = columns.length;
  const lastRowLen = sourceLen % colLen;
  const rows = Math.ceil(sourceLen / colLen);
  const columnsSorted = columns.slice().sort();

  const s = source.slice();
  const matrix: string[][] = Array.from({ length: rows }, () => []);

  for (let i = 0; i < colLen; i += 1) {
    const columnValue = columnsSorted[i];
    const columnNum = columns.indexOf(columnValue);

    if (lastRowLen === 0 || columnNum < lastRowLen) {
      for (let j = 0; j < rows; j += 1) {
        matrix[j][columnNum] = s.shift() as string;
      }
    } else {
      for (let j = 0; j < rows - 1; j += 1) {
        matrix[j][columnNum] = s.shift() as string;
      }
    }
  }

  return matrix;
}

function fillMatrix(positions: Point[], rowLength: number, sourceLen: number, colLen: number): void {
  const lastRowLen = sourceLen % colLen;
  const matrix: Array<Array<number | undefined>> = Array.from({ length: rowLength }, () => []);

  for (let i = 0; i < positions.length; i += 1) {
    const p = positions[i];
    matrix[p.y][p.x] = i;
  }

  const fillRowLength = lastRowLen === 0 ? rowLength : rowLength - 1;
  for (let i = 0; i < fillRowLength; i += 1) {
    const row = matrix[i];
    for (let j = row.length; j < colLen; j += 1) {
      positions.push({ x: j, y: i });
    }
  }

  if (lastRowLen) {
    const row = matrix[rowLength - 1];
    for (let j = row.length; j < lastRowLen; j += 1) {
      positions.push({ x: j, y: rowLength - 1 });
    }
  }
}

function buildTriangle(
  startColumn: number,
  columnLength: number,
  startRow: number,
  rowLength: number,
  sourceLength: number,
  columns: number[],
): Point[] {
  const positions: Point[] = [];
  let currentRow = startRow;
  const lastRowLen = sourceLength % columnLength;

  for (let columnLimit = startColumn; columnLimit < columnLength; columnLimit += 1) {
    if (currentRow === rowLength) {
      break;
    }

    if (currentRow === rowLength - 1 && lastRowLen) {
      for (let currentColumn = 0; currentColumn < Math.min(lastRowLen, columnLimit); currentColumn += 1) {
        positions.push({ x: currentColumn, y: currentRow });
      }
    } else {
      for (let currentColumn = 0; currentColumn < columnLimit; currentColumn += 1) {
        positions.push({ x: currentColumn, y: currentRow });
      }
    }

    currentRow += 1;
  }

  if (currentRow !== rowLength) {
    const columnsSorted = columns.slice().sort((a, b) => a - b);
    const sortedColItem = columnsSorted.indexOf(columns[startColumn]);
    const columnValue = columnsSorted[sortedColItem + 1];
    const nextColumn = columns.indexOf(columnValue);
    return positions.concat(
      buildTriangle(nextColumn, columnLength, currentRow, rowLength, sourceLength, columns),
    );
  }

  return positions;
}

function buildDisruptedPattern(columns: number[], sourceLen: number): Point[] {
  const colLen = columns.length;
  const rows = Math.ceil(sourceLen / colLen);
  const columnsSorted = columns.slice().sort((a, b) => a - b);
  const columnNum = columns.indexOf(columnsSorted[0]);

  const positions = buildTriangle(columnNum, colLen, 0, rows, sourceLen, columns);
  fillMatrix(positions, rows, sourceLen, colLen);
  return positions;
}

export function simpleColumn(source: string[], columns: number[]): string[] {
  const colStrings = toColumnStrings(columns);
  const rows = Math.ceil(source.length / colStrings.length);

  const matrix: string[][] = [];
  for (let i = 0; i < rows; i += 1) {
    const startIndex = i * colStrings.length;
    const endIndex = i === rows - 1 ? source.length : startIndex + colStrings.length;
    matrix.push(source.slice(startIndex, endIndex));
  }

  return flattenByColumns(matrix, colStrings);
}

export function unSimpleColumn(source: string[], columns: number[]): string[] {
  const matrix = unflattenToColumns(source, toColumnStrings(columns));
  return matrix.flat();
}

export function disrupted(source: string[], columns: number[]): string[] {
  const pattern = buildDisruptedPattern(columns, source.length);
  const colStrings = toColumnStrings(columns);
  const rows = Math.ceil(source.length / columns.length);
  const matrix: string[][] = Array.from({ length: rows }, () => []);

  for (let i = 0; i < pattern.length; i += 1) {
    const p = pattern[i];
    matrix[p.y][p.x] = source[i];
  }

  return flattenByColumns(matrix, colStrings);
}

export function undisrupted(source: string[], columns: number[]): string[] {
  const pattern = buildDisruptedPattern(columns, source.length);
  const matrix = unflattenToColumns(source, toColumnStrings(columns));
  const out: string[] = [];

  for (const p of pattern) {
    out.push(matrix[p.y][p.x]);
  }

  return out;
}
