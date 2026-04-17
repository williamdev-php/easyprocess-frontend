/**
 * Qvicko — Design Tokens
 *
 * Color palette (light to dark):
 *   1. #F4E9D4  — Sand Mist (warm accent)
 *   2. #326586  — Petrol Blue (primary)
 *   3. #24506E  — Petrol Blue dark
 *   4. #1A3A50  — Petrol Blue deepest
 */

export const colors = {
  accent: "#F4E9D4",
  primary: "#326586",
  primaryDark: "#24506E",
  primaryDeep: "#1A3A50",

  white: "#FFFFFF",
  background: "#FDFAF5",
  surface: "#FFFFFF",
  border: "#E0D8CB",
  borderLight: "#EDE7DC",

  text: "#1A3A50",
  textSecondary: "#4A7A96",
  textMuted: "#7A9BAD",
  textOnPrimary: "#FFFFFF",

  error: "#C44D4D",
  errorBg: "#FDF0F0",
} as const;

export const radius = {
  sm: "0.5rem",    // 8px
  md: "0.75rem",   // 12px
  lg: "1rem",      // 16px
  xl: "1.25rem",   // 20px
  full: "9999px",
} as const;
