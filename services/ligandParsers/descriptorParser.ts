/**
 * Descriptor Parser
 * Parses chemical descriptor data (SMILES, InChI, etc.)
 */

import { LigandDescriptors } from "@/types/ligand.types";
import { cleanValue, createHeaderMap } from "./cifUtils";

/**
 * Parse descriptor data from a loop structure
 */
export function parseDescriptors(
  headers: string[],
  rows: string[][]
): LigandDescriptors {
  const descriptors: LigandDescriptors = {};
  const headerMap = createHeaderMap(headers);

  for (const row of rows) {
    const getValue = (field: string) => cleanValue(row[headerMap[field]]);

    const type = getValue("pdbx_chem_comp_descriptor.type") || "";
    const descriptor = getValue("pdbx_chem_comp_descriptor.descriptor");

    if (type.includes("SMILES") && !descriptors.smiles) {
      descriptors.smiles = descriptor || undefined;
    } else if (type.includes("InChIKey")) {
      descriptors.inchiKey = descriptor || undefined;
    } else if (type.includes("InChI") && !type.includes("Key")) {
      descriptors.inchi = descriptor || undefined;
    }
  }

  return descriptors;
}
