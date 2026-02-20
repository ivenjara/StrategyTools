import * as React from "react";

const SwapIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Top-left square */}
    <rect x="1" y="1" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.8" fill="none" />
    {/* Bottom-right square */}
    <rect x="14" y="14" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.8" fill="none" />
    {/* Arrow from top-right to bottom-left */}
    <path
      d="M12 5.5 L12 12 L5.5 12"
      stroke="currentColor"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <polyline
      points="8,10 5.5,12 8,14"
      stroke="currentColor"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Arrow from bottom-left to top-right */}
    <path
      d="M12 18.5 L12 12 L18.5 12"
      stroke="currentColor"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <polyline
      points="16,10 18.5,12 16,14"
      stroke="currentColor"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default SwapIcon;
