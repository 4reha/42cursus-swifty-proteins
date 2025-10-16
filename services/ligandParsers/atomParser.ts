/**
 * Atom Parser
 * Parses atom data from CIF loop structures
 */

import { Atom } from "@/types/ligand.types";
import { cleanValue, createHeaderMap } from "./cifUtils";

/**
 * Parse atom data from a loop structure
 */
export function parseAtoms(headers: string[], rows: string[][]): Atom[] {
  const atoms: Atom[] = [];
  const headerMap = createHeaderMap(headers);

  for (const row of rows) {
    const atom: Atom = { atomId: "" };

    // Helper functions
    const getValue = (field: string) => cleanValue(row[headerMap[field]]);
    const getNumber = (field: string) => {
      const val = getValue(field);
      return val ? parseFloat(val) : undefined;
    };
    const getBool = (field: string) => {
      const val = getValue(field);
      return val === "Y" || val === "y" || val === "true";
    };

    // Atom ID and element
    atom.atomId =
      getValue("chem_comp_atom.atom_id") ||
      getValue("chem_comp_atom.pdbx_component_atom_id") ||
      "";
    const elementValue = getValue("chem_comp_atom.type_symbol");
    atom.element = elementValue ?? undefined;

    // Coordinates
    atom.x = getNumber("chem_comp_atom.model_Cartn_x");
    atom.y = getNumber("chem_comp_atom.model_Cartn_y");
    atom.z = getNumber("chem_comp_atom.model_Cartn_z");

    // Ideal coordinates
    atom.idealX = getNumber("chem_comp_atom.pdbx_model_Cartn_x_ideal");
    atom.idealY = getNumber("chem_comp_atom.pdbx_model_Cartn_y_ideal");
    atom.idealZ = getNumber("chem_comp_atom.pdbx_model_Cartn_z_ideal");

    // Flags
    atom.aromatic = getBool("chem_comp_atom.pdbx_aromatic_flag");
    atom.leaving = getBool("chem_comp_atom.pdbx_leaving_atom_flag");
    atom.backbone = getBool("chem_comp_atom.pdbx_backbone_atom_flag");
    atom.nTerminal = getBool("chem_comp_atom.pdbx_n_terminal_atom_flag");
    atom.cTerminal = getBool("chem_comp_atom.pdbx_c_terminal_atom_flag");

    // Stereo config
    atom.stereo = getValue("chem_comp_atom.pdbx_stereo_config");

    atoms.push(atom);
  }

  return atoms;
}
