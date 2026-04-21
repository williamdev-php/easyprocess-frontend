/**
 * Curated list of popular, web-safe Google Fonts.
 * These are widely available, load fast, and work well for websites.
 */
export interface FontOption {
  name: string;
  category: "sans-serif" | "serif" | "display" | "monospace";
}

export const GOOGLE_FONTS: FontOption[] = [
  // Sans-serif
  { name: "Inter", category: "sans-serif" },
  { name: "Roboto", category: "sans-serif" },
  { name: "Open Sans", category: "sans-serif" },
  { name: "Lato", category: "sans-serif" },
  { name: "Montserrat", category: "sans-serif" },
  { name: "Poppins", category: "sans-serif" },
  { name: "Nunito", category: "sans-serif" },
  { name: "Raleway", category: "sans-serif" },
  { name: "Work Sans", category: "sans-serif" },
  { name: "DM Sans", category: "sans-serif" },
  { name: "Source Sans 3", category: "sans-serif" },
  { name: "Manrope", category: "sans-serif" },
  { name: "Plus Jakarta Sans", category: "sans-serif" },
  { name: "Outfit", category: "sans-serif" },
  { name: "Figtree", category: "sans-serif" },
  { name: "Cabin", category: "sans-serif" },
  { name: "Mulish", category: "sans-serif" },
  { name: "Rubik", category: "sans-serif" },
  { name: "Karla", category: "sans-serif" },
  { name: "Lexend", category: "sans-serif" },
  { name: "Space Grotesk", category: "sans-serif" },
  { name: "Albert Sans", category: "sans-serif" },
  { name: "Archivo", category: "sans-serif" },
  { name: "Barlow", category: "sans-serif" },
  { name: "Josefin Sans", category: "sans-serif" },
  { name: "Quicksand", category: "sans-serif" },
  { name: "Ubuntu", category: "sans-serif" },
  { name: "Nunito Sans", category: "sans-serif" },
  { name: "PT Sans", category: "sans-serif" },
  { name: "Noto Sans", category: "sans-serif" },

  // Serif
  { name: "Playfair Display", category: "serif" },
  { name: "Merriweather", category: "serif" },
  { name: "Lora", category: "serif" },
  { name: "Source Serif 4", category: "serif" },
  { name: "PT Serif", category: "serif" },
  { name: "Libre Baskerville", category: "serif" },
  { name: "EB Garamond", category: "serif" },
  { name: "Cormorant Garamond", category: "serif" },
  { name: "DM Serif Display", category: "serif" },
  { name: "Bitter", category: "serif" },
  { name: "Crimson Text", category: "serif" },
  { name: "Spectral", category: "serif" },
  { name: "Vollkorn", category: "serif" },
  { name: "Noto Serif", category: "serif" },
  { name: "Instrument Serif", category: "serif" },

  // Display
  { name: "Oswald", category: "display" },
  { name: "Bebas Neue", category: "display" },
  { name: "Abril Fatface", category: "display" },
  { name: "Righteous", category: "display" },
  { name: "Permanent Marker", category: "display" },
  { name: "Pacifico", category: "display" },
  { name: "Lobster", category: "display" },
  { name: "Comfortaa", category: "display" },
  { name: "Fredoka", category: "display" },

  // Monospace
  { name: "JetBrains Mono", category: "monospace" },
  { name: "Fira Code", category: "monospace" },
  { name: "Source Code Pro", category: "monospace" },
  { name: "IBM Plex Mono", category: "monospace" },
  { name: "Space Mono", category: "monospace" },
];

/** Safe default fonts that work well for most business websites */
export const SAFE_DEFAULT_FONTS = [
  "Inter",
  "Poppins",
  "DM Sans",
  "Outfit",
  "Plus Jakarta Sans",
  "Manrope",
  "Work Sans",
  "Lato",
];

/** Pick a random safe default font */
export function pickSafeDefaultFont(): string {
  return SAFE_DEFAULT_FONTS[Math.floor(Math.random() * SAFE_DEFAULT_FONTS.length)];
}

/** Build a Google Fonts CSS URL for a given font name */
export function googleFontUrl(fontName: string): string {
  const family = fontName.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${family}:wght@300;400;500;600;700&display=swap`;
}
