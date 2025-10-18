/**
 * Share Service
 * 
 * Handles sharing ligand data with screenshot capture
 */

import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

interface ShareLigandParams {
  ligandId: string;
  data: any;
  svgUrl?: string;
  svgXml?: string | null;
  screenshotUri?: string | null;
}

export const shareLigand = async ({
  ligandId,
  data,
  svgUrl,
  svgXml,
  screenshotUri,
}: ShareLigandParams): Promise<void> => {
  console.log('[SHARE_SERVICE] Starting share process for:', ligandId);
  console.log('[SHARE_SERVICE] Screenshot URI:', screenshotUri);

  try {
    // Check if sharing is available
    const isSharingAvailable = await Sharing.isAvailableAsync();

    if (!isSharingAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    // Prepare share content
    const ligandInfo = [
      `Ligand: ${ligandId}`,
      data?.name ? `Name: ${data.name}` : null,
      data?.atoms?.length ? `Atoms: ${data.atoms.length}` : null,
      data?.bonds?.length ? `Bonds: ${data.bonds.length}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    console.log('[SHARE_SERVICE] Ligand info prepared:', ligandInfo);

    // If we have a screenshot, share the image with text
    if (screenshotUri) {
      console.log('[SHARE_SERVICE] Sharing with screenshot');

      try {
        // Verify the file exists
        const fileInfo = await FileSystem.getInfoAsync(screenshotUri);

        if (!fileInfo.exists) {
          console.error('[SHARE_SERVICE] Screenshot file does not exist');
          throw new Error('Screenshot file not found');
        }

        console.log('[SHARE_SERVICE] Screenshot file info:', fileInfo);

        // Share the image file
        await Sharing.shareAsync(screenshotUri, {
          mimeType: 'image/png',
          dialogTitle: `Share ${ligandId} - 3D View`,
          UTI: 'public.png',
        });

        console.log('[SHARE_SERVICE] Screenshot shared successfully');
      } catch (error) {
        console.error('[SHARE_SERVICE] Error sharing screenshot:', error);
        // Fall back to text-only sharing
        throw error;
      }
    } else {
      // No screenshot available - share text only
      console.log('[SHARE_SERVICE] No screenshot available, sharing text only');

      // Create a temporary text file
      const fileName = `${ligandId}_info.txt`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, ligandInfo);

      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: `Share ${ligandId} Information`,
      });

      // Clean up the temporary file
      await FileSystem.deleteAsync(fileUri, { idempotent: true });

      console.log('[SHARE_SERVICE] Text info shared successfully');
    }
  } catch (error: any) {
    console.error('[SHARE_SERVICE] Share failed:', error);
    throw new Error(error.message || 'Failed to share ligand');
  }
};

// Alternative: Save screenshot to device
export const saveScreenshotToDevice = async (
  screenshotUri: string,
  ligandId: string
): Promise<void> => {
  try {
    console.log('[SHARE_SERVICE] Saving screenshot to device');

    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(screenshotUri);
    if (!fileInfo.exists) {
      throw new Error('Screenshot file not found');
    }

    // Create a permanent location
    const fileName = `${ligandId}_3D_${Date.now()}.png`;
    const destinationUri = `${FileSystem.documentDirectory}${fileName}`;

    // Copy to permanent location
    await FileSystem.copyAsync({
      from: screenshotUri,
      to: destinationUri,
    });

    console.log('[SHARE_SERVICE] Screenshot saved to:', destinationUri);
  } catch (error: any) {
    console.error('[SHARE_SERVICE] Failed to save screenshot:', error);
    throw new Error('Failed to save screenshot to device');
  }
};