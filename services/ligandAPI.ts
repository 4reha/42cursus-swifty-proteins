import axios from "axios";
import { LIGAND_API_URL } from "../config/ligands";

// Types for ligand data
export interface LigandAtom {
  id: string;
  symbol: string;
  x: number;
  y: number;
  z: number;
}

export interface LigandBond {
  atom1: string;
  atom2: string;
  order: number;
}

export interface ParsedLigandData {
  id: string;
  name?: string;
  synonyms?: string;
  formula?: string;
  weight?: string;
  atoms: LigandAtom[];
  bonds: LigandBond[];
}

export interface ProgressCallbacks {
  onParseStart?: () => void;
}

export class LigandAPI {
  static async fetchLigandData(
    ligandId: string,
    callbacks?: ProgressCallbacks
  ): Promise<ParsedLigandData> {
    const url = `${LIGAND_API_URL}${ligandId}.cif`;

    console.log(`📡 Fetching: ${url}`);

    const response = await axios.get(url, {
      responseType: "text",
    });

    const cifText = response.data;

    // Notify parsing start
    callbacks?.onParseStart?.();

    return await this.parseCifData(ligandId, cifText, callbacks);
  }

  private static async parseCifData(
    ligandId: string,
    cifText: string,
    callbacks?: ProgressCallbacks
  ): Promise<ParsedLigandData> {
    const lines = cifText.split("\n");
    const result: ParsedLigandData = {
      id: ligandId,
      atoms: [],
      bonds: [],
    };

    const parseContext = {
      inAtomLoop: false,
      inBondLoop: false,
    };

    // Parse molecular data
    for (const line of lines) {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith("#")) continue;

      this.parseBasicInfo(trimmedLine, result);
      this.parseLoopContext(trimmedLine, parseContext);
      this.parseAtomData(trimmedLine, parseContext.inAtomLoop, result.atoms);
      this.parseBondData(trimmedLine, parseContext.inBondLoop, result.bonds);
    }

    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log(`✅ Parsed ${ligandId}:`, {
      atoms: result.atoms.length,
      bonds: result.bonds.length,
      name: result.name,
    });

    return result;
  }

  private static parseBasicInfo(line: string, result: ParsedLigandData): void {
    if (line.startsWith("_chem_comp.name")) {
      result.name = line.split(/\s+/).slice(1).join(" ").replace(/"/g, "");
    } else if (line.startsWith("_chem_comp.formula_weight")) {
      result.weight = line.split(/\s+/)[1];
    } else if (line.startsWith("_chem_comp.formula")) {
      result.formula = line.split(/\s+/).slice(1).join(" ").replace(/"/g, "");
    } else if (line.startsWith("_chem_comp.pdbx_synonyms")) {
      result.synonyms = line.split(/\s+/).slice(1).join(" ").replace(/"/g, "");
    }
  }

  private static parseLoopContext(
    line: string,
    context: { inAtomLoop: boolean; inBondLoop: boolean }
  ): void {
    if (line.startsWith("loop_")) {
      context.inAtomLoop = false;
      context.inBondLoop = false;
    } else if (line.startsWith("_chem_comp_atom.")) {
      context.inAtomLoop = true;
    } else if (line.startsWith("_chem_comp_bond.")) {
      context.inBondLoop = true;
    }
  }

  private static parseAtomData(
    line: string,
    inAtomLoop: boolean,
    atoms: LigandAtom[]
  ): void {
    if (!inAtomLoop || line.startsWith("_")) return;

    const parts = line.split(/\s+/);
    if (parts.length >= 15) {
      atoms.push({
        id: parts[1],
        symbol: parts[3],
        x: parseFloat(parts[10]) || 0,
        y: parseFloat(parts[11]) || 0,
        z: parseFloat(parts[12]) || 0,
      });
    }
  }

  private static parseBondData(
    line: string,
    inBondLoop: boolean,
    bonds: LigandBond[]
  ): void {
    if (!inBondLoop || line.startsWith("_")) return;

    const parts = line.split(/\s+/);
    if (parts.length >= 6) {
      bonds.push({
        atom1: parts[1],
        atom2: parts[2],
        order: parseInt(parts[3]) || 1,
      });
    }
  }
}
