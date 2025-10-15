/**
 * Ligand API Service
 * Fetches and parses ligand data from RCSB PDB
 */

import { LIGAND_API_URL } from "@/config/ligands";
import { ParsedLigandData } from "@/types/ligand.types";
import { logger } from "@/utils/logger";
import axios from "axios";
import { Linking } from "react-native";
import {
  cleanValue,
  parseAtoms,
  parseAudit,
  parseBonds,
  parseDescriptors,
  parseIdentifiers,
  parseKeyValue,
  parseLoop,
} from "./ligandParsers";

/**
 * Map key-value pair to result fields
 */
function mapKeyValueToResult(
  result: ParsedLigandData,
  key: string,
  cleaned: string | null
): void {
  const fieldMap: Record<string, (val: string | null) => void> = {
    name: (val) => {
      result.name = val || undefined;
    },
    type: (val) => {
      result.type = val || undefined;
    },
    pdbx_type: (val) => {
      result.pdbxType = val || undefined;
    },
    formula: (val) => {
      result.formula = val || undefined;
    },
    formula_weight: (val) => {
      result.weight = val ? parseFloat(val) : undefined;
    },
    three_letter_code: (val) => {
      result.threeLetterCode = val || undefined;
    },
    one_letter_code: (val) => {
      result.oneLetterCode = val || undefined;
    },
    pdbx_release_status: (val) => {
      result.releaseStatus = val || undefined;
    },
    pdbx_formal_charge: (val) => {
      result.formalCharge = val ? parseFloat(val) : undefined;
    },
    pdbx_initial_date: (val) => {
      result.initialDate = val || undefined;
    },
    pdbx_modified_date: (val) => {
      result.modifiedDate = val || undefined;
    },
    pdbx_model_coordinates_db_code: (val) => {
      result.pdbxModelDbCode = val || undefined;
    },
    pdbx_processing_site: (val) => {
      result.processingSite = val || undefined;
    },
    pdbx_ambiguous_flag: (val) => {
      result.ambiguousFlag = val || undefined;
    },
    pdbx_pcm: (val) => {
      result.pcm = val || undefined;
    },
  };

  const field = Object.keys(fieldMap).find((f) => key.includes(f));
  if (field) {
    fieldMap[field](cleaned);
  }
}

/**
 * Parse loop structure based on headers
 */
function parseLoopData(
  result: ParsedLigandData,
  headers: string[],
  rows: string[][]
): void {
  const headerStr = headers.join(" ");

  if (headerStr.includes("chem_comp_atom")) {
    result.atoms = parseAtoms(headers, rows);
  } else if (headerStr.includes("chem_comp_bond")) {
    result.bonds = parseBonds(headers, rows);
  } else if (headerStr.includes("pdbx_chem_comp_descriptor")) {
    result.descriptors = parseDescriptors(headers, rows);
  } else if (headerStr.includes("pdbx_chem_comp_identifier")) {
    result.identifiers = parseIdentifiers(headers, rows);
  } else if (headerStr.includes("pdbx_chem_comp_audit")) {
    result.audit = parseAudit(headers, rows);
  }
}

/**
 * Parse CIF data into structured ligand information
 */
export function parseCIFData(text: string, id: string): ParsedLigandData {
  const upId = id.toUpperCase();
  const lines = text.split(/\r?\n/).map((line) => line.trim());

  const result: ParsedLigandData = {
    id: upId,
    atoms: [],
    bonds: [],
    descriptors: {},
    identifiers: {},
    audit: [],
    cifUrl: `${LIGAND_API_URL}${upId}.cif`,
  };

  try {
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      if (!line || line.startsWith("#")) {
        i++;
        continue;
      }

      if (line.startsWith("_chem_comp.")) {
        const kv = parseKeyValue(line);
        if (kv) {
          const cleaned = cleanValue(kv.value);
          mapKeyValueToResult(result, kv.key, cleaned);
        }
        i++;
      } else if (line === "loop_") {
        const { headers, rows, nextIndex } = parseLoop(lines, i + 1);
        parseLoopData(result, headers, rows);
        i = nextIndex;
      } else {
        i++;
      }
    }
  } catch (err: any) {
    logger.warning("Error parsing CIF data", err);
  }

  return result;
}

/**
 * Fetch ligand data from RCSB PDB
 */
export async function fetchLigandData(id: string): Promise<ParsedLigandData> {
  const upId = id.toUpperCase();
  const cifUrl = `${LIGAND_API_URL}${upId}.cif`;

  logger.api(`Fetching ligand data for ${upId}`);

  try {
    const resp = await axios.get(cifUrl, { responseType: "text" });

    if (resp.status !== 200) {
      throw new Error(`HTTP ${resp.status}`);
    }

    const text = resp.data as string;
    const result = parseCIFData(text, upId);

    logger.success(`Ligand data fetched for ${upId}`);
    return result;
  } catch (err: any) {
    logger.error(`Failed to fetch CIF for ${id}`, err);
    throw new Error(`Failed to fetch CIF for ${id}: ${err?.message || err}`);
  }
}

/**
 * Open SVG in external browser
 */
export function openSvgInBrowser(svgUrl: string): Promise<any> {
  return Linking.openURL(svgUrl);
}

export default {
  fetchLigandData,
  parseCIFData,
  openSvgInBrowser,
};
