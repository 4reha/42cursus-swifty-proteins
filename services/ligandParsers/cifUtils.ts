/**
 * CIF Parser Utilities
 * Helper functions for parsing CIF (Crystallographic Information File) format
 */

/**
 * Clean a CIF value by removing quotes and handling special characters
 */
export function cleanValue(value: string | undefined | null): string | null {
  if (!value) return null;

  let cleaned = value.trim();

  // Remove quotes
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1);
  }

  // Handle special CIF values
  if (cleaned === "?" || cleaned === ".") return null;

  return cleaned;
}

/**
 * Parse a single key-value line from CIF
 */
export function parseKeyValue(
  line: string
): { key: string; value: string } | null {
  const regex = /^(_[\w.]+)\s+(.+)$/;
  const match = regex.exec(line);
  if (!match) return null;

  return {
    key: match[1],
    value: match[2],
  };
}

/**
 * Parse a loop structure and return headers and data rows
 */
export function parseLoop(
  lines: string[],
  startIndex: number
): {
  headers: string[];
  rows: string[][];
  nextIndex: number;
} {
  let index = startIndex;
  const headers: string[] = [];

  // Parse headers (lines starting with _)
  while (index < lines.length && lines[index].trim().startsWith("_")) {
    const header = lines[index].trim().replace(/^_/, "");
    headers.push(header);
    index++;
  }

  // Parse data rows
  const rows: string[][] = [];
  while (index < lines.length) {
    const line = lines[index].trim();

    // Stop at empty line, comment, or new loop
    if (!line || line.startsWith("#") || line.startsWith("loop_")) {
      break;
    }

    // Split by whitespace, handling quoted strings
    const values = line.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    if (values.length > 0) {
      rows.push(values.map((v) => v.replace(/^["']/, "").replace(/["']$/, "")));
    }

    index++;
  }

  return { headers, rows, nextIndex: index };
}

/**
 * Create a header index map for quick lookup
 */
export function createHeaderMap(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  headers.forEach((header, index) => {
    map[header] = index;
  });
  return map;
}
