import * as opentype from 'opentype.js';
import { CustomFont } from '../../types';

export async function parseFontFile(file: File): Promise<{ familyName: string; fontFace: FontFace }> {
  const buffer = await file.arrayBuffer();

  let familyName = file.name.replace(/\.[^/.]+$/, '');
  try {
    const parsed = opentype.parse(buffer);
    if (parsed.names && parsed.names.fontFamily) {
      const family = parsed.names.fontFamily.en || Object.values(parsed.names.fontFamily)[0];
      if (family && typeof family === 'string' && family.trim().length > 0) {
        familyName = family.trim();
      }
    }
  } catch (err) {
    console.warn('opentype.js could not parse font family name, falling back to file name:', err);
  }

  // Create FontFace API instance
  const fontFace = new FontFace(familyName, buffer);
  await fontFace.load();
  document.fonts.add(fontFace);

  return { familyName, fontFace };
}

export function isLocalFontAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'queryLocalFonts' in window;
}

export async function queryLocalFontsSupported(): Promise<CustomFont[]> {
  if (!isLocalFontAccessSupported()) {
    throw new Error('Local Font Access API is not supported in this browser.');
  }

  try {
    // @ts-expect-error Local Font Access API window.queryLocalFonts
    const fontDataArray = await window.queryLocalFonts();
    const uniqueFamilies = new Set<string>();

    for (const fontData of fontDataArray) {
      if (fontData.family) {
        uniqueFamilies.add(fontData.family);
      }
    }

    return Array.from(uniqueFamilies).sort().map((family) => ({
      id: `local-sys-${family.replace(/\s+/g, '-').toLowerCase()}`,
      family,
      source: 'local-system',
    }));
  } catch (err) {
    console.error('Failed to query local fonts:', err);
    throw err;
  }
}
