/**
 * Outfit Actions Utilities
 * Functions for sharing, downloading, and managing outfits
 * Safari-compatible with proper fallbacks
 */

import html2canvas from 'html2canvas';

/**
 * Copy text to clipboard with Safari fallback
 */
const copyToClipboard = async (text: string): Promise<void> => {
  // Try modern Clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (err) {
      console.warn('Clipboard API failed, using fallback', err);
    }
  }

  // Fallback for Safari and older browsers
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
    textArea.remove();
  } catch (err) {
    textArea.remove();
    throw new Error('Failed to copy to clipboard');
  }
};

/**
 * Share outfit to social media or copy link
 */
export const shareOutfit = async (
  platform: 'twitter' | 'facebook' | 'instagram' | 'copy',
  outfitImageUrl: string,
  occasion: string | null
) => {
  const text = `Check out my AI-generated ${occasion || 'outfit'}! ✨`;
  const url = window.location.href;
  const hashtags = 'AIFashion,OutfitAssistant,OOTD';

  switch (platform) {
    case 'twitter':
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`,
        '_blank',
        'width=600,height=400,noopener,noreferrer'
      );
      break;

    case 'facebook':
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
        '_blank',
        'width=600,height=400,noopener,noreferrer'
      );
      break;

    case 'instagram':
      // Instagram doesn't support direct sharing via URL
      // Copy link and show instructions
      try {
        await copyToClipboard(`${text}\n${url}`);
        alert(
          'Link copied! Open Instagram and paste this in your story or bio.\n\nTip: Screenshot the outfit and share it directly!'
        );
      } catch (error) {
        throw new Error('Failed to copy link. Please try again.');
      }
      break;

    case 'copy':
      try {
        await copyToClipboard(`${text}\n${url}`);
        return 'Link copied to clipboard!';
      } catch (error) {
        throw new Error('Failed to copy link. Please try again.');
      }
  }

  return null;
};

/**
 * Download outfit image as PNG (Safari-compatible)
 */
export const downloadOutfitImage = async (imageUrl: string, occasion: string | null) => {
  try {
    const filename = `outfit_${occasion?.toLowerCase().replace(/\s+/g, '_') || 'generated'}_${Date.now()}.png`;

    // Try fetch with CORS
    const response = await fetch(imageUrl, {
      mode: 'cors',
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }

    const blob = await response.blob();

    // Safari-compatible download
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      // IE11 & Edge
      (window.navigator as any).msSaveOrOpenBlob(blob, filename);
    } else {
      // Modern browsers including Safari
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();

      // Cleanup with timeout for Safari
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    }

    return 'Outfit downloaded successfully!';
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to download outfit. Please try again.');
  }
};

/**
 * Download outfit card as image (Safari-compatible with html2canvas)
 */
export const downloadOutfitCard = async (elementId: string, occasion: string | null) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Outfit card element not found');
    }

    // Safari-optimized html2canvas options
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: window.devicePixelRatio || 2, // Use device pixel ratio for Safari
      logging: false,
      useCORS: true,
      allowTaint: false, // More strict for Safari
      imageTimeout: 15000, // Longer timeout for Safari
      // Safari-specific fixes
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    return new Promise<string>((resolve, reject) => {
      // Convert to blob and download
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create image'));
            return;
          }

          const filename = `outfit_card_${occasion?.toLowerCase().replace(/\s+/g, '_') || 'generated'}_${Date.now()}.png`;

          // Safari-compatible download
          if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
            (window.navigator as any).msSaveOrOpenBlob(blob, filename);
          } else {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();

            // Cleanup with timeout for Safari
            setTimeout(() => {
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }, 100);
          }

          resolve('Outfit card downloaded successfully!');
        },
        'image/png',
        1.0 // Maximum quality
      );
    });
  } catch (error) {
    console.error('Download card failed:', error);
    throw new Error('Failed to download outfit card. Please try again.');
  }
};

/**
 * Copy outfit details to clipboard as text (Safari-compatible)
 */
export const copyOutfitDetails = async (outfitDescription: string, occasion: string | null) => {
  try {
    const parsed = JSON.parse(outfitDescription);

    const text = `
🎨 AI-Generated Outfit ${occasion ? `for ${occasion}` : ''}

✨ Concept: ${parsed.outfit_concept}

👔 Pieces:
${parsed.items
  .map(
    (item: any, idx: number) =>
      `${idx + 1}. ${item.type} - ${item.color}
   ${item.description}
   Style: ${item.style_notes}`
  )
  .join('\n\n')}

🎨 Color Palette: ${parsed.color_palette}

📍 Why This Works: ${parsed.occasion_notes}

🛍️ Shop The Look:
${parsed.product_recommendations
  .map(
    (product: any, idx: number) =>
      `${idx + 1}. ${product.item} by ${product.brand} - ${product.price}
   ${product.description}`
  )
  .join('\n\n')}

---
Generated by AI Outfit Assistant ✨
    `.trim();

    // Use Safari-compatible copy function
    await copyToClipboard(text);
    return 'Outfit details copied to clipboard!';
  } catch (error) {
    console.error('Copy failed:', error);
    throw new Error('Failed to copy outfit details. Please try again.');
  }
};

/**
 * Share outfit via Web Share API (Safari iOS compatible)
 */
export const shareViaWebShare = async (
  outfitImageUrl: string,
  occasion: string | null
): Promise<string> => {
  if (!navigator.share) {
    throw new Error('Web Share API not supported on this device');
  }

  try {
    // Check if files sharing is supported (Safari may not support it)
    const canShareFiles = navigator.canShare && navigator.canShare({ files: [] as File[] });

    if (canShareFiles) {
      // Fetch image as blob
      const response = await fetch(outfitImageUrl, {
        mode: 'cors',
        cache: 'no-cache',
      });
      const blob = await response.blob();
      const file = new File([blob], 'outfit.png', { type: 'image/png' });

      await navigator.share({
        title: `My AI-Generated ${occasion || 'Outfit'}`,
        text: 'Check out my AI-generated outfit! ✨',
        files: [file],
      });
    } else {
      // Fallback for Safari: share URL only
      await navigator.share({
        title: `My AI-Generated ${occasion || 'Outfit'}`,
        text: 'Check out my AI-generated outfit! ✨',
        url: window.location.href,
      });
    }

    return 'Outfit shared successfully!';
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // User cancelled sharing
      return 'Sharing cancelled';
    }
    throw new Error('Failed to share outfit. Please try another method.');
  }
};

/**
 * Generate shareable link for outfit
 */
export const generateShareLink = (outfitId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}?outfit=${outfitId}`;
};

/**
 * Check if Web Share API is supported
 */
export const isWebShareSupported = (): boolean => {
  return navigator.share !== undefined;
};
