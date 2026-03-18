/**
 * MediOS Design Tokens
 * Single source of truth for the design system.
 * Update here when mock designs arrive.
 */

export const colors = {
  // ── Segment primaries ──
  teal:     "#0d7a6e",
  tealMid:  "#1a9e8f",
  tealBg:   "#e6f5f3",
  tealBorder: "rgba(13,122,110,0.2)",

  blue:     "#1a5c8a",
  blueBg:   "#e6f0f8",
  blueBorder: "rgba(26,92,138,0.2)",

  amber:    "#b86a10",
  amberBg:  "#fdf2e6",
  amberBorder: "rgba(184,106,16,0.2)",

  plum:     "#6b3a7a",
  plumBg:   "#f3edf7",
  plumBorder: "rgba(107,58,122,0.2)",

  // ── Semantic ──
  red:      "#b52a2a",
  redBg:    "#fdeaea",
  green:    "#1a7a4a",
  greenBg:  "#e6f5ee",

  // ── Neutrals ──
  ink:      "#111918",
  ink2:     "#1e2b29",
  bg:       "#f4f7f6",
  paper:    "#ffffff",
  border:   "#dce8e4",
  muted:    "#8aa39d",
  sub:      "#5a7a74",
};

/** Per-segment theme: { primary, bg, border, gradient, text } */
export const SEGMENT_THEME = {
  clinic: {
    primary:  colors.teal,
    bg:       colors.tealBg,
    border:   colors.tealBorder,
    gradient: "linear-gradient(135deg, #0d7a6e 0%, #1a9e8f 100%)",
    text:     "text-teal-700",
    ring:     "ring-teal-500",
  },
  lab: {
    primary:  colors.blue,
    bg:       colors.blueBg,
    border:   colors.blueBorder,
    gradient: "linear-gradient(135deg, #1a5c8a 0%, #2473a8 100%)",
    text:     "text-blue-700",
    ring:     "ring-blue-500",
  },
  pharmacy: {
    primary:  colors.amber,
    bg:       colors.amberBg,
    border:   colors.amberBorder,
    gradient: "linear-gradient(135deg, #b86a10 0%, #d4841e 100%)",
    text:     "text-amber-700",
    ring:     "ring-amber-500",
  },
  ayush: {
    primary:  colors.plum,
    bg:       colors.plumBg,
    border:   colors.plumBorder,
    gradient: "linear-gradient(135deg, #6b3a7a 0%, #8a4f9c 100%)",
    text:     "text-purple-700",
    ring:     "ring-purple-500",
  },
};
