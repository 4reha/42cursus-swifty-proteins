import { LIGAND_API_URL } from '@/config/ligands';
import axios from 'axios';
import { Linking } from 'react-native';
import { Atom, Bond, ParsedLigandData } from '@/types/types';

/**
 * Clean a CIF value by removing quotes and handling special characters
 */
function cleanValue(value: string | undefined | null): string | null {
	if (!value) return null;
	let cleaned = value.trim();

	// Remove surrounding quotes
	cleaned = cleaned.replace(/^["']|["']$/g, '');

	// CIF uses '?' and '.' for missing/unknown values
	if (cleaned === '?' || cleaned === '.') return null;

	return cleaned || null;
}

/**
 * Parse a single key-value line from CIF
 */
function parseKeyValue(line: string): { key: string; value: string } | null {
	const match = line.match(/^(_\S+)\s+(.+)$/);
	if (!match) return null;

	const key = match[1].replace(/^_/, ''); // Remove leading underscore
	const value = match[2].trim();

	return { key, value };
}

/**
 * Parse a loop structure and return headers and data rows
 */
function parseLoop(lines: string[], startIndex: number): {
	headers: string[];
	rows: string[][];
	nextIndex: number;
} {
	let index = startIndex;
	const headers: string[] = [];

	// Parse headers (lines starting with _)
	while (index < lines.length && lines[index].trim().startsWith('_')) {
		const header = lines[index].trim().replace(/^_/, '');
		headers.push(header);
		index++;
	}

	// Parse data rows
	const rows: string[][] = [];
	while (index < lines.length) {
		const line = lines[index].trim();

		// Stop at empty line, comment, or new loop
		if (!line || line.startsWith('#') || line.startsWith('loop_')) {
			break;
		}

		// Split by whitespace, handling quoted strings
		const values = line.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
		if (values.length > 0) {
			rows.push(values.map(v => v.replace(/^"|"$/g, '')));
		}

		index++;
	}

	return { headers, rows, nextIndex: index };
}

/**
 * Parse atom data from a loop structure
 */
function parseAtoms(headers: string[], rows: string[][]): Atom[] {
	const atoms: Atom[] = [];

	// Create header index map for quick lookup
	const headerMap: { [key: string]: number } = {};
	headers.forEach((header, index) => {
		headerMap[header] = index;
	});

	for (const row of rows) {
		const atom: Atom = { atomId: '' };

		// Map CIF fields to Atom properties
		const getValue = (field: string) => cleanValue(row[headerMap[field]]);
		const getNumber = (field: string) => {
			const val = getValue(field);
			return val ? parseFloat(val) : undefined;
		};
		const getBool = (field: string) => {
			const val = getValue(field);
			return val === 'Y' || val === 'y' || val === 'true';
		};

		// Atom ID and element
		atom.atomId = getValue('chem_comp_atom.atom_id') || getValue('chem_comp_atom.pdbx_component_atom_id') || '';
		const elementValue = getValue('chem_comp_atom.type_symbol');
		atom.element = elementValue === null ? undefined : elementValue;

		// Coordinates
		atom.x = getNumber('chem_comp_atom.model_Cartn_x');
		atom.y = getNumber('chem_comp_atom.model_Cartn_y');
		atom.z = getNumber('chem_comp_atom.model_Cartn_z');

		// Ideal coordinates
		atom.idealX = getNumber('chem_comp_atom.pdbx_model_Cartn_x_ideal');
		atom.idealY = getNumber('chem_comp_atom.pdbx_model_Cartn_y_ideal');
		atom.idealZ = getNumber('chem_comp_atom.pdbx_model_Cartn_z_ideal');

		// Flags
		atom.aromatic = getBool('chem_comp_atom.pdbx_aromatic_flag');
		atom.leaving = getBool('chem_comp_atom.pdbx_leaving_atom_flag');
		atom.backbone = getBool('chem_comp_atom.pdbx_backbone_atom_flag');
		atom.nTerminal = getBool('chem_comp_atom.pdbx_n_terminal_atom_flag');
		atom.cTerminal = getBool('chem_comp_atom.pdbx_c_terminal_atom_flag');

		// Stereo config
		atom.stereo = getValue('chem_comp_atom.pdbx_stereo_config');

		atoms.push(atom);
	}

	return atoms;
}

/**
 * Parse bond data from a loop structure
 */
function parseBonds(headers: string[], rows: string[][]): Bond[] {
	const bonds: Bond[] = [];

	const headerMap: { [key: string]: number } = {};
	headers.forEach((header, index) => {
		headerMap[header] = index;
	});

	for (const row of rows) {
		const getValue = (field: string) => cleanValue(row[headerMap[field]]);

		const bond: Bond = {
			a: getValue('chem_comp_bond.atom_id_1') || '',
			b: getValue('chem_comp_bond.atom_id_2') || '',
			order: getValue('chem_comp_bond.value_order') || 'SING'
		};

		if (bond.a && bond.b) {
			bonds.push(bond);
		}
	}

	return bonds;
}

/**
 * Parse descriptor data from a loop structure
 */
function parseDescriptors(headers: string[], rows: string[][]): {
	smiles?: string;
	inchi?: string;
	inchiKey?: string;
} {
	const descriptors: any = {};

	const headerMap: { [key: string]: number } = {};
	headers.forEach((header, index) => {
		headerMap[header] = index;
	});

	for (const row of rows) {
		const getValue = (field: string) => cleanValue(row[headerMap[field]]);

		const type = getValue('pdbx_chem_comp_descriptor.type') || '';
		const descriptor = getValue('pdbx_chem_comp_descriptor.descriptor');

		if (type.includes('SMILES') && !descriptors.smiles) {
			descriptors.smiles = descriptor;
		} else if (type.includes('InChIKey')) {
			descriptors.inchiKey = descriptor;
		} else if (type.includes('InChI') && !type.includes('Key')) {
			descriptors.inchi = descriptor;
		}
	}

	return descriptors;
}

/**
 * Parse identifier data from a loop structure
 */
function parseIdentifiers(headers: string[], rows: string[][]): {
	systematicName?: string[];
} {
	const identifiers: any = { systematicName: [] };

	const headerMap: { [key: string]: number } = {};
	headers.forEach((header, index) => {
		headerMap[header] = index;
	});

	for (const row of rows) {
		const getValue = (field: string) => cleanValue(row[headerMap[field]]);

		const type = getValue('pdbx_chem_comp_identifier.type') || '';
		const identifier = getValue('pdbx_chem_comp_identifier.identifier');

		if (type.includes('SYSTEMATIC') && identifier) {
			identifiers.systematicName.push(identifier);
		}
	}

	return identifiers;
}

/**
 * Parse audit data from a loop structure
 */
function parseAudit(headers: string[], rows: string[][]): {
	action?: string;
	date?: string;
	site?: string;
}[] {
	const audit: any[] = [];

	const headerMap: { [key: string]: number } = {};
	headers.forEach((header, index) => {
		headerMap[header] = index;
	});

	for (const row of rows) {
		const getValue = (field: string) => cleanValue(row[headerMap[field]]);

		audit.push({
			action: getValue('pdbx_chem_comp_audit.action_type') || undefined,
			date: getValue('pdbx_chem_comp_audit.date') || undefined,
			site: getValue('pdbx_chem_comp_audit.processing_site') || undefined
		});
	}

	return audit;
}

/**
 * Main function to fetch and parse CIF data
 */
export function parseCIFData(text: string, id: string): ParsedLigandData {
	const upId = id.toUpperCase();

	// Split into lines and clean
	const lines = text.split(/\r?\n/).map(line => line.trim());

	// Initialize result
	const result: ParsedLigandData = {
		id: upId,
		atoms: [],
		bonds: [],
		descriptors: {},
		identifiers: {},
		audit: [],
		cifUrl: `${LIGAND_API_URL}${upId}.cif`
	};

	// Parse line by line
	try {
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

			// Skip empty lines and comments
			if (!line || line.startsWith('#')) continue;

			// Handle key-value pairs
			if (line.startsWith('_chem_comp.')) {
				const kv = parseKeyValue(line);
				if (!kv) continue;

				const { key, value } = kv;
				const cleaned = cleanValue(value);

				// Map to result fields
				if (key.includes('chem_comp.name')) result.name = cleaned || undefined;
				else if (key.includes('chem_comp.type')) result.type = cleaned || undefined;
				else if (key.includes('chem_comp.pdbx_type')) result.pdbxType = cleaned || undefined;
				else if (key.includes('chem_comp.formula')) result.formula = cleaned || undefined;
				else if (key.includes('chem_comp.formula_weight')) result.weight = cleaned ? parseFloat(cleaned) : undefined;
				else if (key.includes('chem_comp.three_letter_code')) result.threeLetterCode = cleaned || undefined;
				else if (key.includes('chem_comp.one_letter_code')) result.oneLetterCode = cleaned || undefined;
				else if (key.includes('chem_comp.pdbx_release_status')) result.releaseStatus = cleaned || undefined;
				else if (key.includes('chem_comp.pdbx_formal_charge')) result.formalCharge = cleaned ? parseFloat(cleaned) : undefined;
				else if (key.includes('chem_comp.pdbx_initial_date')) result.initialDate = cleaned || undefined;
				else if (key.includes('chem_comp.pdbx_modified_date')) result.modifiedDate = cleaned || undefined;
				else if (key.includes('chem_comp.pdbx_model_coordinates_db_code')) result.pdbxModelDbCode = cleaned || undefined;
				else if (key.includes('chem_comp.pdbx_processing_site')) result.processingSite = cleaned || undefined;
				else if (key.includes('chem_comp.pdbx_ambiguous_flag')) result.ambiguousFlag = cleaned || undefined;
				else if (key.includes('chem_comp.pdbx_pcm')) result.pcm = cleaned || undefined;
			}

			// Handle loop structures
			else if (line === 'loop_') {
				const { headers, rows, nextIndex } = parseLoop(lines, i + 1);

				// Determine loop type by headers
				const headerStr = headers.join(' ');

				if (headerStr.includes('chem_comp_atom')) {
					result.atoms = parseAtoms(headers, rows);
				} else if (headerStr.includes('chem_comp_bond')) {
					result.bonds = parseBonds(headers, rows);
				} else if (headerStr.includes('pdbx_chem_comp_descriptor')) {
					result.descriptors = parseDescriptors(headers, rows);
				} else if (headerStr.includes('pdbx_chem_comp_identifier')) {
					result.identifiers = parseIdentifiers(headers, rows);
				} else if (headerStr.includes('pdbx_chem_comp_audit')) {
					result.audit = parseAudit(headers, rows);
				}

				// Skip to next section
				i = nextIndex - 1;
			}
		}
	} catch (err: any) {
		console.warn('Error parsing CIF data:', err);
		// Return partial results even if parsing fails
	}

	return result;
}

export async function fetchLigandData(id: string): Promise<ParsedLigandData> {
	const upId = id.toUpperCase();
	const cifUrl = `${LIGAND_API_URL}${upId}.cif`;

	// Fetch CIF file
	let text: string;
	try {
		const resp = await axios.get(cifUrl, { responseType: 'text' });
		if (resp.status !== 200) {
			throw new Error(`HTTP ${resp.status}`);
		}
		text = resp.data as string;
	} catch (err: any) {
		throw new Error(`Failed to fetch CIF for ${id}: ${err?.message || err}`);
	}

	// Use the parsing function
	return parseCIFData(text, upId);
}

export function openSvgInBrowser(svgUrl: string) {
	return Linking.openURL(svgUrl);
}

export default {
	fetchLigandData,
	openSvgInBrowser,
};