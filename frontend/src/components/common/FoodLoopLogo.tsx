import React from 'react';

interface FoodLoopLogoProps {
  size?: number;
  className?: string;
}

/**
 * FoodLoop brand logo — pure SVG, no images.
 * Circular rescue loop (emerald + amber arcs) with a leaf in the center.
 */
export const FoodLoopLogo: React.FC<FoodLoopLogoProps> = ({ size = 40, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="FoodLoop logo"
  >
    {/* Dark emerald rounded-square background */}
    <rect width="40" height="40" rx="11" fill="#064e3b" />

    {/* Outer emerald arc (bottom-left half of loop) */}
    <path
      d="M20 9C13.373 9 8 14.373 8 21C8 27.627 13.373 33 20 33"
      stroke="#34d399"
      strokeWidth="2.4"
      strokeLinecap="round"
    />

    {/* Outer amber arc (top-right half of loop) */}
    <path
      d="M20 33C26.627 33 32 27.627 32 21C32 14.373 26.627 9 20 9"
      stroke="#fbbf24"
      strokeWidth="2.4"
      strokeLinecap="round"
    />

    {/* Arrow tip on emerald arc */}
    <path
      d="M16.5 7.5L20 10L17 13"
      stroke="#34d399"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Leaf shape in center */}
    <path
      d="M20 14C20 14 26.5 16.5 25 22C23.5 26.5 17 25 17 21C17 17 20 14 20 14Z"
      fill="white"
      fillOpacity="0.92"
    />

    {/* Leaf center stem */}
    <line
      x1="20"
      y1="20.5"
      x2="20"
      y2="25"
      stroke="#064e3b"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.55"
    />
  </svg>
);

export default FoodLoopLogo;
