import * as React from "react";
import { tokens } from "../../theme/tokens";

/**
 * Inline SVG icons ported verbatim from the design mockup
 * (NightShift Pane v4 Tabbed.dc.html). 1.2–1.5px stroke, round caps.
 */

type PathSpec = { tag?: "path" | "rect" | "line" | "circle"; [key: string]: unknown };

function strokeIcon(size: number, viewBox: number, paths: PathSpec[], strokeWidth = 1.3): JSX.Element {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${viewBox} ${viewBox}`} fill="none">
      {paths.map(({ tag = "path", ...attrs }, i) =>
        React.createElement(tag, {
          key: i,
          stroke: "currentColor",
          strokeWidth,
          strokeLinecap: "round",
          ...attrs,
        })
      )}
    </svg>
  );
}

const line = (x1: number, y1: number, x2: number, y2: number): PathSpec => ({ tag: "line", x1, y1, x2, y2 });
const rect = (x: number, y: number, w: number, h: number): PathSpec => ({
  tag: "rect",
  x,
  y,
  width: w,
  height: h,
  rx: 1,
});

// Align & distribute (17px, viewBox 18)
export const AlignLeftIcon = () => strokeIcon(17, 18, [line(3, 2, 3, 16), rect(5.5, 4, 8, 3.5), rect(5.5, 10.5, 5, 3.5)]);
export const AlignCenterIcon = () => strokeIcon(17, 18, [line(9, 2, 9, 16), rect(4, 4, 10, 3.5), rect(6, 10.5, 6, 3.5)]);
export const AlignRightIcon = () => strokeIcon(17, 18, [line(15, 2, 15, 16), rect(4.5, 4, 8, 3.5), rect(7.5, 10.5, 5, 3.5)]);
export const DistributeHIcon = () =>
  strokeIcon(17, 18, [line(2, 3, 2, 15), line(16, 3, 16, 15), rect(5, 6, 3, 6), rect(10, 6, 3, 6)]);
export const AlignTopIcon = () => strokeIcon(17, 18, [line(2, 3, 16, 3), rect(4, 5.5, 3.5, 8), rect(10.5, 5.5, 3.5, 5)]);
export const AlignMiddleIcon = () => strokeIcon(17, 18, [line(2, 9, 16, 9), rect(4, 4, 3.5, 10), rect(10.5, 6, 3.5, 6)]);
export const AlignBottomIcon = () =>
  strokeIcon(17, 18, [line(2, 15, 16, 15), rect(4, 4.5, 3.5, 8), rect(10.5, 7.5, 3.5, 5)]);
export const DistributeVIcon = () =>
  strokeIcon(17, 18, [line(3, 2, 15, 2), line(3, 16, 15, 16), rect(6, 5, 6, 3), rect(6, 10, 6, 3)]);

// Swap (17px)
export const SwapIcon = () =>
  strokeIcon(17, 18, [
    rect(2, 2, 7, 7),
    rect(9, 9, 7, 7),
    { d: "M12 4 L15 4 L15 7", fill: "none" },
    { d: "M6 14 L3 14 L3 11", fill: "none" },
  ]);
export const SwapHIcon = () =>
  strokeIcon(17, 18, [{ d: "M5 6 L2 9 L5 12", fill: "none" }, { d: "M13 6 L16 9 L13 12", fill: "none" }, line(2, 9, 16, 9)]);
export const SwapVIcon = () =>
  strokeIcon(17, 18, [{ d: "M6 5 L9 2 L12 5", fill: "none" }, { d: "M6 13 L9 16 L12 13", fill: "none" }, line(9, 2, 9, 16)]);
export const TopLeftIcon = () => strokeIcon(17, 18, [line(2, 2, 16, 2), line(2, 2, 2, 16), rect(4.5, 4.5, 7, 5)]);

// Match size (15px)
export const MatchWidthIcon = () =>
  strokeIcon(15, 18, [{ d: "M2 9 H16 M2 9 L5 6 M2 9 L5 12 M16 9 L13 6 M16 9 L13 12", fill: "none" }]);
export const MatchHeightIcon = () =>
  strokeIcon(15, 18, [{ d: "M9 2 V16 M9 2 L6 5 M9 2 L12 5 M9 16 L6 13 M9 16 L12 13", fill: "none" }]);
export const MatchBothIcon = () =>
  strokeIcon(15, 18, [{ tag: "rect", x: 3, y: 3, width: 12, height: 12, rx: 1 }, { d: "M6 9 H12 M9 6 V12", fill: "none" }]);

// Tab icons (15px)
export const TabArrangeIcon = () =>
  strokeIcon(15, 18, [
    { tag: "rect", x: 2, y: 2, width: 6, height: 6, rx: 1 },
    { tag: "rect", x: 10, y: 10, width: 6, height: 6, rx: 1 },
    { d: "M11 4 L16 4 M4 11 L4 16", fill: "none" },
  ]);
export const TabElementsIcon = () =>
  strokeIcon(15, 18, [{ tag: "circle", cx: 9, cy: 9, r: 7 }, { d: "M9 2 A7 7 0 0 1 9 16 Z", fill: "currentColor" }]);
export const TabExportIcon = () =>
  strokeIcon(15, 18, [{ d: "M9 2 V10 M9 10 L6 7 M9 10 L12 7", fill: "none" }, { d: "M3 13 H15", fill: "none" }]);

// Title bar
export const MoonLogoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path d="M12 8.5A5.5 5.5 0 1 1 5.5 2 4.3 4.3 0 0 0 12 8.5Z" fill={tokens.accent} />
  </svg>
);
export const CloseIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

// Text margins link toggle
export const LinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
    <path
      d="M7.5 10.5 L10.5 7.5 M6 9 L4.5 10.5 A2.8 2.8 0 0 0 8.5 14.5 L10 13 M12 9 L13.5 7.5 A2.8 2.8 0 0 0 9.5 3.5 L8 5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

// Position clipboard copy
export const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="1" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
    <rect x="4" y="4" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill={tokens.emphBg} />
  </svg>
);

// Table → text convert
export const TableConvertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
    <rect x="1.5" y="2" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" />
    <path d="M1.5 5.5 H10.5 M1.5 8 H10.5 M6 2 V11" stroke="currentColor" strokeWidth="1" />
    <path
      d="M12 13 L16.5 13 M16.5 13 L14.5 11 M16.5 13 L14.5 15"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Export
export const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1V9M7 9L4 6M7 9L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 11H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
export const EnvelopeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="2.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M1.5 3.5L7 8L12.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Harvey balls: fill = 0..4 quarters
export function HarveyBallIcon({ fill, selected }: { fill: 0 | 1 | 2 | 3 | 4; selected: boolean }): JSX.Element {
  const c = selected ? tokens.accent : tokens.textSecondary;
  const wedge = {
    1: "M11 11 L11 2 A9 9 0 0 1 20 11 Z",
    2: "M11 2 A9 9 0 0 1 11 20 Z",
    3: "M11 11 L11 2 A9 9 0 1 1 2 11 Z",
  }[fill as 1 | 2 | 3];
  return (
    <svg width="22" height="22" viewBox="0 0 22 22">
      <circle cx="11" cy="11" r="9" stroke={c} strokeWidth="1.4" fill={fill === 4 ? c : "none"} />
      {fill > 0 && fill < 4 && <path d={wedge} fill={c} />}
    </svg>
  );
}
