/**
 * Design tokens for the NightShift pane, resolved through CSS custom
 * properties so the theme can switch at runtime (dark "Nightshift" /
 * light "Dayshift"). The actual palettes live in global.css — dark on
 * :root, light under body[data-theme="light"].
 * Source of truth: design_handoff_nightshift_pane/README.md (v4 dark, v2 light).
 */
export const tokens = {
  // Surfaces
  paneBg: "var(--ns-pane-bg)",
  deskBg: "var(--ns-desk-bg)",
  card: "var(--ns-card)",
  cardHover: "var(--ns-card-hover)",
  cardActive: "var(--ns-card-active)",
  emphBg: "var(--ns-emph-bg)",
  emphBorder: "var(--ns-emph-border)",
  emphHover: "var(--ns-emph-hover)",
  inputBg: "var(--ns-input-bg)",
  hoverGhost: "var(--ns-hover-ghost)",

  // Borders
  border: "var(--ns-border)",
  borderControl: "var(--ns-border-control)",

  // Accent
  accent: "var(--ns-accent)",
  accentHover: "var(--ns-accent-hover)",

  // Text
  textStrong: "var(--ns-text-strong)",
  textPrimary: "var(--ns-text-primary)",
  textSecondary: "var(--ns-text-secondary)",
  textMuted: "var(--ns-text-muted)",
  textFaint: "var(--ns-text-faint)",
  textDisabled: "var(--ns-text-disabled)",
  placeholder: "var(--ns-placeholder)",

  // Semantic
  success: "var(--ns-success)",
  warn: "var(--ns-warn)",
  danger: "var(--ns-danger)",

  // Segmented control
  segTrack: "var(--ns-seg-track)",
  segActive: "var(--ns-seg-active)",

  // Shape & type (theme-independent)
  fontFamily: '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif',
  radiusButton: "7px",
  radiusInput: "6px",
  radiusSegment: "5px",
} as const;

export type ThemeName = "dark" | "light";
