/**
 * Bond Parser
 * Parses bond data from CIF loop structures
 */

import { Bond } from "@/types/ligand.types";
import { cleanValue, createHeaderMap } from "./cifUtils";

/**
 * Parse bond data from a loop structure
 */
export function parseBonds(headers: string[], rows: string[][]): Bond[] {
  const bonds: Bond[] = [];
  const headerMap = createHeaderMap(headers);

  for (const row of rows) {
    const getValue = (field: string) => cleanValue(row[headerMap[field]]);

    const bond: Bond = {
      a: getValue("chem_comp_bond.atom_id_1") || "",
      b: getValue("chem_comp_bond.atom_id_2") || "",
      order: getValue("chem_comp_bond.value_order") || "SING",
    };

    if (bond.a && bond.b) {
      bonds.push(bond);
    }
  }

  return bonds;
}
