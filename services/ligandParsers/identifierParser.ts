/**
 * Identifier Parser
 * Parses chemical identifier data
 */

import { LigandIdentifiers } from "@/types/ligand.types";
import { cleanValue, createHeaderMap } from "./cifUtils";

/**
 * Parse identifier data from a loop structure
 */
export function parseIdentifiers(
  headers: string[],
  rows: string[][]
): LigandIdentifiers {
  const identifiers: LigandIdentifiers = { systematicName: [] };
  const headerMap = createHeaderMap(headers);

  for (const row of rows) {
    const getValue = (field: string) => cleanValue(row[headerMap[field]]);

    const type = getValue("pdbx_chem_comp_identifier.type") || "";
    const identifier = getValue("pdbx_chem_comp_identifier.identifier");

    if (type.includes("SYSTEMATIC") && identifier) {
      identifiers.systematicName?.push(identifier);
    }
  }

  return identifiers;
}
