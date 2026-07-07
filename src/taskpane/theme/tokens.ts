/**
 * Design tokens for the NightShift dark theme.
 * Source of truth: design_handoff_nightshift_pane/README.md (v4 tabbed design).
 */
export const tokens = {
  // Surfaces
  paneBg: "#14171F",
  deskBg: "#0B0D14",
  card: "#1F2432",
  cardHover: "#242A3C",
  cardActive: "#2A3150",
  emphBg: "#232A3F",
  emphBorder: "#39415C",
  emphHover: "#283050",
  inputBg: "#1A1E2A",
  hoverGhost: "#222736",

  // Borders
  border: "#262B38",
  borderControl: "#2C3244",

  // Accent
  accent: "#9BA3FF",
  accentHover: "#B0B7FF",

  // Text
  textPrimary: "#E7EAF3",
  textSecondary: "#C9CEDE",
  textMuted: "#8B92A8",
  textFaint: "#7E859C",
  textDisabled: "#565D74",
  placeholder: "#5A6078",

  // Semantic
  success: "#7BD8A0",
  warn: "#F5B454",
  danger: "#F08A8A",

  // Segmented control
  segTrack: "#1A1E2A",
  segActive: "#2C3244",

  // Shape & type
  fontFamily: '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif',
  radiusButton: "7px",
  radiusInput: "6px",
  radiusSegment: "5px",
} as const;
