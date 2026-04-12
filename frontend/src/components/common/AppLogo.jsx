import React from 'react';

/**
 * App logo — open book with a flowing river "journey" path.
 * Used in Navbar and Footer. Renders as an inline SVG
 * inside the existing gradient-primary rounded container.
 *
 * Props:
 *   size  – width & height in px (default 36)
 */
const AppLogo = ({ size = 36, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Left page */}
    <path
      d="M30,12 C30,12 10,10 8,14 L8,50 C10,46 30,48 30,48 Z"
      fill="#fff"
      opacity="0.95"
    />
    {/* Right page */}
    <path
      d="M34,12 C34,12 54,10 56,14 L56,50 C54,46 34,48 34,48 Z"
      fill="#fff"
      opacity="0.85"
    />
    {/* Spine */}
    <path
      d="M30,12 L30,48 C31,49 33,49 34,48 L34,12 C33,11 31,11 30,12 Z"
      fill="#f5f0e8"
    />

    {/* Text lines on left page */}
    <line x1="14" y1="22" x2="26" y2="22" stroke="#d4d4d4" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="14" y1="28" x2="24" y2="28" stroke="#d4d4d4" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="14" y1="34" x2="26" y2="34" stroke="#d4d4d4" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="14" y1="40" x2="22" y2="40" stroke="#d4d4d4" strokeWidth="1.2" strokeLinecap="round" />

    {/* Flowing river path on right page */}
    <path
      d="M38,44 Q52,41 42,34 Q35,29 46,24 Q52,21 46,17"
      fill="none"
      stroke="#dc7f34"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M38,44 Q52,41 42,34 Q35,29 46,24 Q52,21 46,17"
      fill="none"
      stroke="#c06a28"
      strokeWidth="0.8"
      strokeLinecap="round"
    />
    {/* Destination dot */}
    <circle cx="46" cy="17" r="2" fill="#dc7f34" />
    <circle cx="46" cy="17" r="0.8" fill="#fff" />
  </svg>
);

export default AppLogo;
