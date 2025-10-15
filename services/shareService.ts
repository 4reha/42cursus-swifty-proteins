/**
 * Share Service
 * Handles sharing ligand data
 */

import { ParsedLigandData } from "@/types/ligand.types";
import { logger } from "@/utils/logger";
import { Alert, Share } from "react-native";

export interface ShareOptions {
  ligandId: string;
  data: ParsedLigandData | null;
  svgUrl?: string;
  svgXml?: string | null;
  baseUrl?: string;
}

/**
 * Build share message from ligand data
 */
function buildShareMessage(
  ligandId: string,
  data: ParsedLigandData | null,
  url: string,
  svgUrl?: string,
  svgXml?: string | null
): string {
  let message = `🧬 Ligand: ${ligandId}\n`;

  if (data?.name) message += `📝 Name: ${data.name}\n`;
  if (data?.formula) message += `⚗️ Formula: ${data.formula}\n`;
  if (data?.weight)
    message += `⚖️ Molecular Weight: ${data.weight.toFixed(2)} Da\n`;
  if (data?.atoms?.length) message += `🔬 Atoms: ${data.atoms.length}\n`;
  if (data?.bonds?.length) message += `🔗 Bonds: ${data.bonds.length}\n`;
  if (data?.type) message += `📋 Type: ${data.type}\n`;

  message += `\n🔗 View details: ${url}`;

  if (svgXml && svgUrl) {
    message += `\n\n🖼️ 2D Structure: ${svgUrl}`;
  }

  return message;
}

/**
 * Share ligand data
 */
export async function shareLigand(options: ShareOptions): Promise<void> {
  const {
    ligandId,
    data,
    svgUrl,
    svgXml,
    baseUrl = "https://example.com/explore",
  } = options;

  try {
    const url = `${baseUrl}/${encodeURIComponent(ligandId)}`;
    const message = buildShareMessage(ligandId, data, url, svgUrl, svgXml);

    const shareOptions = {
      message,
      url,
      title: `Ligand ${ligandId} - Swifty Protein`,
    };

    logger.info(`Sharing ligand: ${ligandId}`);
    const result = await Share.share(shareOptions);

    if (result.action === Share.dismissedAction) {
      logger.info("Share cancelled by user");
      return;
    }

    logger.success("Ligand shared successfully");
  } catch (err) {
    logger.error("Share failed", err);
    Alert.alert(
      "Share Failed",
      "Unable to share the ligand data. Please try again."
    );
    throw err;
  }
}

export default {
  shareLigand,
};
