// ---------------------------------------------------------------------------
// Shared color palette presets used by both the free tool and create-site wizard
// ---------------------------------------------------------------------------

export interface Palette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export const PALETTE_PRESETS: Palette[] = [
  // ===================== Blues (0-7) =====================
  { primary: "#326586", secondary: "#24506E", accent: "#F4E9D4", background: "#FDFAF5", text: "#1A1A1A" },
  { primary: "#1E40AF", secondary: "#3B82F6", accent: "#F59E0B", background: "#F9FAFB", text: "#1F2937" },
  { primary: "#2563EB", secondary: "#93C5FD", accent: "#EF4444", background: "#FFFFFF", text: "#1E293B" },
  { primary: "#0EA5E9", secondary: "#38BDF8", accent: "#F97316", background: "#F8FAFC", text: "#0F172A" },
  { primary: "#1D4ED8", secondary: "#BFDBFE", accent: "#10B981", background: "#EFF6FF", text: "#1E3A5F" },
  { primary: "#0284C7", secondary: "#7DD3FC", accent: "#FBBF24", background: "#F0F9FF", text: "#1F2937" },
  { primary: "#1E3A8A", secondary: "#60A5FA", accent: "#F472B6", background: "#F8FAFC", text: "#1E293B" },
  { primary: "#075985", secondary: "#BAE6FD", accent: "#A3E635", background: "#F0F9FF", text: "#0C4A6E" },

  // ===================== Teals & Cyans (8-13) =====================
  { primary: "#0D9488", secondary: "#5EEAD4", accent: "#F43F5E", background: "#F0FDFA", text: "#134E4A" },
  { primary: "#0891B2", secondary: "#67E8F9", accent: "#A855F7", background: "#ECFEFF", text: "#164E63" },
  { primary: "#14B8A6", secondary: "#99F6E4", accent: "#FB923C", background: "#FFFFFF", text: "#1F2937" },
  { primary: "#0E7490", secondary: "#A5F3FC", accent: "#E11D48", background: "#F8FFFE", text: "#155E75" },
  { primary: "#115E59", secondary: "#2DD4BF", accent: "#FBBF24", background: "#F0FDFA", text: "#134E4A" },
  { primary: "#06B6D4", secondary: "#CFFAFE", accent: "#D946EF", background: "#FFFFFF", text: "#164E63" },

  // ===================== Greens (14-21) =====================
  { primary: "#059669", secondary: "#6EE7B7", accent: "#8B5CF6", background: "#F0FDF4", text: "#1A2E1A" },
  { primary: "#16A34A", secondary: "#86EFAC", accent: "#E11D48", background: "#FFFFFF", text: "#1F2937" },
  { primary: "#65A30D", secondary: "#BEF264", accent: "#0EA5E9", background: "#FEFCE8", text: "#1A2E05" },
  { primary: "#166534", secondary: "#BBF7D0", accent: "#D97706", background: "#F7FEE7", text: "#14532D" },
  { primary: "#15803D", secondary: "#4ADE80", accent: "#F43F5E", background: "#FFFFFF", text: "#1C3829" },
  { primary: "#22C55E", secondary: "#DCFCE7", accent: "#7C3AED", background: "#FAFFF7", text: "#14532D" },
  { primary: "#84CC16", secondary: "#ECFCCB", accent: "#DB2777", background: "#FEFCE8", text: "#365314" },
  { primary: "#047857", secondary: "#A7F3D0", accent: "#F97316", background: "#ECFDF5", text: "#064E3B" },

  // ===================== Purples & Violets (22-29) =====================
  { primary: "#7C3AED", secondary: "#C4B5FD", accent: "#F97316", background: "#FAF5FF", text: "#2E1065" },
  { primary: "#6D28D9", secondary: "#A78BFA", accent: "#10B981", background: "#FFFFFF", text: "#1E1B4B" },
  { primary: "#9333EA", secondary: "#D8B4FE", accent: "#EC4899", background: "#FDF4FF", text: "#3B0764" },
  { primary: "#5B21B6", secondary: "#DDD6FE", accent: "#FBBF24", background: "#EDE9FE", text: "#1E1B4B" },
  { primary: "#7E22CE", secondary: "#E9D5FF", accent: "#14B8A6", background: "#FAFAFE", text: "#581C87" },
  { primary: "#6B21A8", secondary: "#C084FC", accent: "#F59E0B", background: "#FAF5FF", text: "#3B0764" },
  { primary: "#4F46E5", secondary: "#A5B4FC", accent: "#F43F5E", background: "#EEF2FF", text: "#312E81" },
  { primary: "#8B5CF6", secondary: "#F3E8FF", accent: "#EF4444", background: "#FFFFFF", text: "#4C1D95" },

  // ===================== Pinks & Roses (30-36) =====================
  { primary: "#DB2777", secondary: "#FBCFE8", accent: "#0EA5E9", background: "#FDF2F8", text: "#1F2937" },
  { primary: "#E11D48", secondary: "#FDA4AF", accent: "#2563EB", background: "#FFF1F2", text: "#1C1917" },
  { primary: "#EC4899", secondary: "#F9A8D4", accent: "#8B5CF6", background: "#FFFFFF", text: "#292524" },
  { primary: "#BE185D", secondary: "#FBD0E0", accent: "#059669", background: "#FDF2F8", text: "#831843" },
  { primary: "#F472B6", secondary: "#FCE7F3", accent: "#1D4ED8", background: "#FFFFFF", text: "#1F2937" },
  { primary: "#D946EF", secondary: "#F0ABFC", accent: "#22C55E", background: "#FDF4FF", text: "#701A75" },
  { primary: "#C026D3", secondary: "#E879F9", accent: "#FBBF24", background: "#FAF5FF", text: "#86198F" },

  // ===================== Reds & Warm (37-43) =====================
  { primary: "#DC2626", secondary: "#FCA5A5", accent: "#1D4ED8", background: "#FFFFFF", text: "#1C1917" },
  { primary: "#B91C1C", secondary: "#FECACA", accent: "#F59E0B", background: "#FEF2F2", text: "#292524" },
  { primary: "#EA580C", secondary: "#FDBA74", accent: "#0891B2", background: "#FFF7ED", text: "#1C1917" },
  { primary: "#EF4444", secondary: "#FEE2E2", accent: "#6366F1", background: "#FFFFFF", text: "#1F2937" },
  { primary: "#991B1B", secondary: "#F87171", accent: "#10B981", background: "#FEF2F2", text: "#450A0A" },
  { primary: "#C2410C", secondary: "#FED7AA", accent: "#7C3AED", background: "#FFFBEB", text: "#431407" },
  { primary: "#E74C3C", secondary: "#FADBD8", accent: "#3498DB", background: "#FDFEFE", text: "#2C3E50" },

  // ===================== Oranges & Yellows (44-51) =====================
  { primary: "#D97706", secondary: "#FDE68A", accent: "#7C3AED", background: "#FFFBEB", text: "#292524" },
  { primary: "#F59E0B", secondary: "#FEF3C7", accent: "#1E40AF", background: "#FFFFFF", text: "#1F2937" },
  { primary: "#E85D04", secondary: "#FFBA08", accent: "#3A86FF", background: "#FFF8F0", text: "#2B2D42" },
  { primary: "#CA8A04", secondary: "#FEF9C3", accent: "#E11D48", background: "#FFFFF0", text: "#422006" },
  { primary: "#EA580C", secondary: "#FED7AA", accent: "#6366F1", background: "#FFFBEB", text: "#9A3412" },
  { primary: "#FB923C", secondary: "#FFEDD5", accent: "#0891B2", background: "#FFFFFF", text: "#1C1917" },
  { primary: "#EAB308", secondary: "#FEF08A", accent: "#8B5CF6", background: "#FEFCE8", text: "#3F3F46" },
  { primary: "#F97316", secondary: "#FFF7ED", accent: "#14B8A6", background: "#FFFFFF", text: "#1F2937" },

  // ===================== Earth Tones (52-61) =====================
  { primary: "#92400E", secondary: "#D4A373", accent: "#2D6A4F", background: "#FEFAE0", text: "#292524" },
  { primary: "#78350F", secondary: "#A8763E", accent: "#059669", background: "#FAF3E0", text: "#3E2723" },
  { primary: "#6B4226", secondary: "#C4A882", accent: "#D4A017", background: "#F5F0EB", text: "#2C1810" },
  { primary: "#5C4033", secondary: "#A0816C", accent: "#C84B31", background: "#FAF6F1", text: "#3E2723" },
  { primary: "#8E793E", secondary: "#AD974F", accent: "#E07A5F", background: "#F8F5F1", text: "#231F20" },
  { primary: "#7C6A46", secondary: "#BFA87D", accent: "#3D5A80", background: "#F5F1EB", text: "#3E2723" },
  { primary: "#A0522D", secondary: "#D2B48C", accent: "#228B22", background: "#FFF8F0", text: "#3E2723" },
  { primary: "#8B7355", secondary: "#C8B896", accent: "#B7410E", background: "#F5F0E8", text: "#3C2F2F" },
  { primary: "#704214", secondary: "#DEB887", accent: "#1B7A5A", background: "#FFFBF0", text: "#3B2F00" },
  { primary: "#6D4C41", secondary: "#BCAAA4", accent: "#FF7043", background: "#EFEBE9", text: "#3E2723" },

  // ===================== Pastels (62-71) =====================
  { primary: "#6C63FF", secondary: "#B8B5FF", accent: "#FF6584", background: "#F8F9FF", text: "#2D3748" },
  { primary: "#48BB78", secondary: "#B5EAD7", accent: "#FFDAC1", background: "#FAFFFE", text: "#2D3748" },
  { primary: "#9F7AEA", secondary: "#D6BCFA", accent: "#FC8181", background: "#FAF5FF", text: "#2D3748" },
  { primary: "#ED8936", secondary: "#FEEBC8", accent: "#667EEA", background: "#FFFAF0", text: "#2D3748" },
  { primary: "#4FD1C5", secondary: "#B2F5EA", accent: "#F687B3", background: "#F0FFFF", text: "#234E52" },
  { primary: "#76E4F7", secondary: "#C4F1F9", accent: "#FBB6CE", background: "#F7FFFF", text: "#2A4365" },
  { primary: "#F6AD55", secondary: "#FEEBC8", accent: "#90CDF4", background: "#FFFAF0", text: "#4A3728" },
  { primary: "#B794F4", secondary: "#E9D8FD", accent: "#68D391", background: "#FAF5FF", text: "#44337A" },
  { primary: "#FC8181", secondary: "#FED7D7", accent: "#63B3ED", background: "#FFF5F5", text: "#742A2A" },
  { primary: "#9AE6B4", secondary: "#C6F6D5", accent: "#FBB6CE", background: "#F0FFF4", text: "#22543D" },

  // ===================== Neutral / Minimal (72-79) =====================
  { primary: "#4B5563", secondary: "#9CA3AF", accent: "#3B82F6", background: "#FFFFFF", text: "#1F2937" },
  { primary: "#374151", secondary: "#D1D5DB", accent: "#10B981", background: "#F9FAFB", text: "#111827" },
  { primary: "#1F2937", secondary: "#6B7280", accent: "#8B5CF6", background: "#FFFFFF", text: "#111827" },
  { primary: "#334155", secondary: "#94A3B8", accent: "#F59E0B", background: "#F8FAFC", text: "#0F172A" },
  { primary: "#44403C", secondary: "#A8A29E", accent: "#EA580C", background: "#FAFAF9", text: "#1C1917" },
  { primary: "#525252", secondary: "#D4D4D4", accent: "#EC4899", background: "#FFFFFF", text: "#171717" },
  { primary: "#27272A", secondary: "#A1A1AA", accent: "#22D3EE", background: "#FAFAFA", text: "#18181B" },
  { primary: "#3F3F46", secondary: "#71717A", accent: "#A3E635", background: "#FFFFFF", text: "#18181B" },

  // ===================== Luxury / Premium (80-89) =====================
  { primary: "#B8860B", secondary: "#DAA520", accent: "#1A1A2E", background: "#FFFEF7", text: "#1A1A1A" },
  { primary: "#1A1A2E", secondary: "#16213E", accent: "#D4AF37", background: "#FAFAFA", text: "#1A1A2E" },
  { primary: "#2C3333", secondary: "#395B64", accent: "#C9A227", background: "#FEFEFE", text: "#2C3333" },
  { primary: "#0F0E17", secondary: "#A7A9BE", accent: "#FF8906", background: "#FFFFFE", text: "#0F0E17" },
  { primary: "#2D2D2D", secondary: "#C9B99A", accent: "#D4A574", background: "#FAF7F2", text: "#1A1A1A" },
  { primary: "#1B2838", secondary: "#8BADC1", accent: "#D4AF37", background: "#F8F9FA", text: "#1B2838" },
  { primary: "#3C1642", secondary: "#6B3A5D", accent: "#F1C40F", background: "#FBF8FC", text: "#3C1642" },
  { primary: "#2B2D42", secondary: "#8D99AE", accent: "#EF233C", background: "#EDF2F4", text: "#2B2D42" },
  { primary: "#1D3557", secondary: "#457B9D", accent: "#E63946", background: "#F1FAEE", text: "#1D3557" },
  { primary: "#264653", secondary: "#2A9D8F", accent: "#E9C46A", background: "#FEFEFE", text: "#264653" },

  // ===================== Neon / Vibrant (90-99) =====================
  { primary: "#6C5CE7", secondary: "#A29BFE", accent: "#FD79A8", background: "#FFFFFF", text: "#2D3436" },
  { primary: "#00B894", secondary: "#55EFC4", accent: "#E17055", background: "#FAFFFE", text: "#2D3436" },
  { primary: "#E84393", secondary: "#FD79A8", accent: "#00CEC9", background: "#FFFFFF", text: "#2D3436" },
  { primary: "#0984E3", secondary: "#74B9FF", accent: "#FDCB6E", background: "#F8FBFF", text: "#2D3436" },
  { primary: "#00B4D8", secondary: "#90E0EF", accent: "#FF006E", background: "#FFFFFF", text: "#1B263B" },
  { primary: "#FF006E", secondary: "#FF5C8A", accent: "#00F5D4", background: "#FFFFFF", text: "#1A1A2E" },
  { primary: "#7400B8", secondary: "#C77DFF", accent: "#80FFDB", background: "#FAFAFE", text: "#240046" },
  { primary: "#3A0CA3", secondary: "#7209B7", accent: "#F72585", background: "#FFFFFF", text: "#10002B" },
  { primary: "#4361EE", secondary: "#4CC9F0", accent: "#F72585", background: "#FAFBFF", text: "#1B1B3A" },
  { primary: "#06D6A0", secondary: "#B5FFE9", accent: "#EF476F", background: "#FFFFFF", text: "#1B263B" },

  // ===================== Vintage / Retro (100-109) =====================
  { primary: "#CB997E", secondary: "#DDBEA9", accent: "#6B705C", background: "#FFE8D6", text: "#3D3229" },
  { primary: "#BC6C25", secondary: "#DDA15E", accent: "#283618", background: "#FEFAE0", text: "#283618" },
  { primary: "#606C38", secondary: "#A3B18A", accent: "#BC6C25", background: "#FEFAE0", text: "#283618" },
  { primary: "#8E7DBE", secondary: "#B8A9D1", accent: "#D4956A", background: "#F5F0F6", text: "#3D2C5E" },
  { primary: "#D4A276", secondary: "#E8C9A4", accent: "#5C7457", background: "#FFF5EB", text: "#4A3728" },
  { primary: "#957DAD", secondary: "#D291BC", accent: "#FEC8D8", background: "#FDFCFD", text: "#4A3A59" },
  { primary: "#6A8D73", secondary: "#B5C99A", accent: "#E07A5F", background: "#F7F9F4", text: "#344E41" },
  { primary: "#A4161A", secondary: "#BA181B", accent: "#E5E5E5", background: "#FFF0F0", text: "#3C0000" },
  { primary: "#CC5803", secondary: "#E2711D", accent: "#124559", background: "#FFF5EB", text: "#3D1C02" },
  { primary: "#5F0F40", secondary: "#9A031E", accent: "#FB8B24", background: "#FFF5F7", text: "#380620" },

  // ===================== Nature / Organic (110-117) =====================
  { primary: "#344E41", secondary: "#3A5A40", accent: "#DAD7CD", background: "#FAFDF7", text: "#2D3A2D" },
  { primary: "#588157", secondary: "#A3B18A", accent: "#F4A261", background: "#F5F7F2", text: "#344E41" },
  { primary: "#1B4332", secondary: "#52B788", accent: "#D4A373", background: "#F0F7F4", text: "#1B4332" },
  { primary: "#023E8A", secondary: "#0077B6", accent: "#F4A261", background: "#F0F8FF", text: "#03045E" },
  { primary: "#005F73", secondary: "#0A9396", accent: "#EE9B00", background: "#F0FDFD", text: "#001219" },
  { primary: "#BB3E03", secondary: "#E9D8A6", accent: "#005F73", background: "#FEFCF3", text: "#3D1503" },
  { primary: "#386641", secondary: "#6A994E", accent: "#BC4749", background: "#F2E8CF", text: "#283618" },
  { primary: "#7F5539", secondary: "#B08968", accent: "#52796F", background: "#F7F0E8", text: "#3E2723" },

  // ===================== Dark Themes (118-135) =====================
  { primary: "#3B82F6", secondary: "#1E40AF", accent: "#F59E0B", background: "#0F172A", text: "#F1F5F9" },
  { primary: "#6366F1", secondary: "#312E81", accent: "#F472B6", background: "#1E1B4B", text: "#E0E7FF" },
  { primary: "#8B5CF6", secondary: "#4C1D95", accent: "#34D399", background: "#1C1033", text: "#EDE9FE" },
  { primary: "#22D3EE", secondary: "#155E75", accent: "#F97316", background: "#0C1222", text: "#E2E8F0" },
  { primary: "#10B981", secondary: "#065F46", accent: "#F59E0B", background: "#0D1117", text: "#D1FAE5" },
  { primary: "#EC4899", secondary: "#831843", accent: "#A78BFA", background: "#18181B", text: "#FAFAFA" },
  { primary: "#F43F5E", secondary: "#881337", accent: "#38BDF8", background: "#1A1A2E", text: "#F1F5F9" },
  { primary: "#14B8A6", secondary: "#134E4A", accent: "#F472B6", background: "#111827", text: "#F0FDFA" },
  { primary: "#A855F7", secondary: "#581C87", accent: "#FB923C", background: "#09090B", text: "#FAFAF9" },
  { primary: "#FBBF24", secondary: "#92400E", accent: "#60A5FA", background: "#1C1917", text: "#FFFBEB" },
  { primary: "#E879F9", secondary: "#701A75", accent: "#2DD4BF", background: "#170B1E", text: "#FAE8FF" },
  { primary: "#4ADE80", secondary: "#166534", accent: "#C084FC", background: "#0A0A0A", text: "#F0FDF4" },
  { primary: "#FB7185", secondary: "#9F1239", accent: "#67E8F9", background: "#18181B", text: "#FFE4E6" },
  { primary: "#38BDF8", secondary: "#0369A1", accent: "#FB923C", background: "#0F172A", text: "#E0F2FE" },
  { primary: "#818CF8", secondary: "#3730A3", accent: "#FCA5A5", background: "#1E1B4B", text: "#C7D2FE" },
  { primary: "#2DD4BF", secondary: "#115E59", accent: "#F9A8D4", background: "#111827", text: "#CCFBF1" },
  { primary: "#F472B6", secondary: "#9D174D", accent: "#34D399", background: "#1F2937", text: "#FECDD3" },
  { primary: "#FACC15", secondary: "#854D0E", accent: "#818CF8", background: "#18181B", text: "#FEF9C3" },
];

// ---------------------------------------------------------------------------
// Categories (index ranges)
// ---------------------------------------------------------------------------

export type Category =
  | "all"
  | "blues"
  | "teals"
  | "greens"
  | "purples"
  | "pinks"
  | "reds"
  | "oranges"
  | "earth"
  | "pastels"
  | "neutral"
  | "luxury"
  | "neon"
  | "vintage"
  | "nature"
  | "dark";

export const CATEGORY_RANGES: Record<Exclude<Category, "all">, [number, number]> = {
  blues:   [0,   7],
  teals:   [8,   13],
  greens:  [14,  21],
  purples: [22,  29],
  pinks:   [30,  36],
  reds:    [37,  43],
  oranges: [44,  51],
  earth:   [52,  61],
  pastels: [62,  71],
  neutral: [72,  79],
  luxury:  [80,  89],
  neon:    [90,  99],
  vintage: [100, 109],
  nature:  [110, 117],
  dark:    [118, 135],
};

export const CATEGORIES: Category[] = [
  "all", "blues", "teals", "greens", "purples", "pinks", "reds",
  "oranges", "earth", "pastels", "neutral", "luxury", "neon",
  "vintage", "nature", "dark",
];

export function randomPalette(): Palette {
  return PALETTE_PRESETS[Math.floor(Math.random() * PALETTE_PRESETS.length)];
}
