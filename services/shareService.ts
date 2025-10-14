import { Alert, Share } from 'react-native';
import { ParsedLigandData } from './ligandAPI';

export interface ShareOptions {
	ligandId: string;
	data: ParsedLigandData | null;
	svgUrl?: string;
	svgXml?: string | null;
	baseUrl?: string;
}

// Note: SVG to image conversion requires additional setup
// For now, we'll share the SVG URL directly

export const shareLigand = async (options: ShareOptions) => {
	const { ligandId, data, svgUrl, svgXml, baseUrl = 'https://example.com/explore' } = options;

	try {
		const url = `${baseUrl}/${encodeURIComponent(ligandId)}`;

		// Build comprehensive share message
		let message = `🧬 Ligand: ${ligandId}\n`;

		if (data?.name) {
			message += `📝 Name: ${data.name}\n`;
		}

		if (data?.formula) {
			message += `⚗️ Formula: ${data.formula}\n`;
		}

		if (data?.weight) {
			message += `⚖️ Molecular Weight: ${data.weight.toFixed(2)} Da\n`;
		}

		if (data?.atoms?.length) {
			message += `🔬 Atoms: ${data.atoms.length}\n`;
		}

		if (data?.bonds?.length) {
			message += `🔗 Bonds: ${data.bonds.length}\n`;
		}

		if (data?.type) {
			message += `📋 Type: ${data.type}\n`;
		}

		message += `\n🔗 View details: ${url}`;

		// Prepare share options
		const shareOptions: any = {
			message,
			url,
			title: `Ligand ${ligandId} - Swifty Protein`
		};

		// If we have SVG data, include it in the message
		if (svgXml && svgUrl) {
			message += `\n\n🖼️ 2D Structure: ${svgUrl}`;
			shareOptions.message = message;
		}


		const result = await Share.share(shareOptions);

		// Check if user cancelled the share
		if (result.action === Share.dismissedAction) {
			// Don't throw an error for user cancellation
			return;
		}

	} catch (err) {
		// Only show alert for actual errors, not user cancellation
		Alert.alert('Share Failed', 'Unable to share the ligand data. Please try again.');
		throw err; // Re-throw so the calling component can handle it
	}
};

export default {
	shareLigand,
};
