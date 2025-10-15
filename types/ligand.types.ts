/**
 * Ligand and molecule related types
 */

export interface Atom {
  atomId: string;
  element?: string;
  type?: string;
  x?: number;
  y?: number;
  z?: number;
  idealX?: number;
  idealY?: number;
  idealZ?: number;
  aromatic?: boolean;
  leaving?: boolean;
  stereo?: string | null;
  backbone?: boolean;
  nTerminal?: boolean;
  cTerminal?: boolean;
}

export interface Bond {
  a: string;
  b: string;
  order: string;
}

export interface ParsedLigandData {
  id: string;
  name?: string;
  type?: string;
  pdbxType?: string;
  formula?: string;
  weight?: number;
  oneLetterCode?: string;
  releaseStatus?: string;
  threeLetterCode?: string;
  synonyms?: string[] | string;
  formalCharge?: string | number;
  initialDate?: string;
  modifiedDate?: string;
  descriptors?: LigandDescriptors;
  identifiers?: LigandIdentifiers;
  atoms: Atom[];
  bonds: Bond[];
  svgUrl?: string;
  cifUrl?: string;
  pdbxModelDbCode?: string;
  processingSite?: string;
  ambiguousFlag?: string;
  pcm?: string;
  audit?: AuditEntry[];
}

export interface LigandDescriptors {
  smiles?: string;
  inchi?: string;
  inchiKey?: string;
}

export interface LigandIdentifiers {
  systematicName?: string[];
}

export interface AuditEntry {
  action?: string;
  date?: string;
  site?: string;
}

export interface FavoriteProtein {
  id: string;
  name: string;
  type?: string;
  lastViewed: string;
  atomCount?: number;
  bondCount?: number;
}
