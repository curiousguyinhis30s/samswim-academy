import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export const SwimmerFreestyle: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="19" cy="6" r="2.5" />
    <path d="M3 18c1.5-1 3-2 5-2s3.5 1 5 2 3 2 5 2 3.5-1 5-2" />
    <path d="M6 12l4-3 3 2 4-4" />
    <path d="M17 7l-1.5 2.5" />
    <path d="M10 9l-4 2" />
  </svg>
);

export const SwimmerBackstroke: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="5" cy="8" r="2.5" />
    <path d="M3 18c1.5-1 3-2 5-2s3.5 1 5 2 3 2 5 2 3.5-1 5-2" />
    <path d="M7 10.5l4 1 3-1 4 1" />
    <path d="M7 10.5l-2-3" />
    <path d="M18 11.5l2-3" />
  </svg>
);

export const SwimmerButterfly: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="6" r="2.5" />
    <path d="M3 18c1.5-1 3-2 5-2s3.5 1 5 2 3 2 5 2 3.5-1 5-2" />
    <path d="M12 8.5v3" />
    <path d="M12 10c-3-1-5-3-7-2" />
    <path d="M12 10c3-1 5-3 7-2" />
    <path d="M10 14l-3 1" />
    <path d="M14 14l3 1" />
  </svg>
);

export const WaterWaves: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 6c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    <path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    <path d="M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
  </svg>
);

export const PoolLane: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="4" width="20" height="16" rx="1" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <line x1="2" y1="14" x2="22" y2="14" />
    <circle cx="6" cy="7" r="1" fill="currentColor" />
    <circle cx="12" cy="7" r="1" fill="currentColor" />
    <circle cx="18" cy="7" r="1" fill="currentColor" />
    <circle cx="6" cy="17" r="1" fill="currentColor" />
    <circle cx="12" cy="17" r="1" fill="currentColor" />
    <circle cx="18" cy="17" r="1" fill="currentColor" />
  </svg>
);

export const Stopwatch: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="14" r="8" />
    <line x1="12" y1="14" x2="12" y2="10" />
    <line x1="12" y1="14" x2="15" y2="14" />
    <line x1="10" y1="2" x2="14" y2="2" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="19" y1="7" x2="21" y2="5" />
  </svg>
);

export const Goggles: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <ellipse cx="6.5" cy="12" rx="4.5" ry="4" />
    <ellipse cx="17.5" cy="12" rx="4.5" ry="4" />
    <path d="M11 12h2" />
    <path d="M2 10c0-2 1-4 2-4" />
    <path d="M22 10c0-2-1-4-2-4" />
    <line x1="4" y1="6" x2="6" y2="8" />
    <line x1="20" y1="6" x2="18" y2="8" />
  </svg>
);

export const Trophy: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 4h12v6a6 6 0 0 1-12 0V4z" />
    <path d="M6 6H4a2 2 0 0 0-2 2v1a3 3 0 0 0 3 3h1" />
    <path d="M18 6h2a2 2 0 0 1 2 2v1a3 3 0 0 1-3 3h-1" />
    <line x1="12" y1="16" x2="12" y2="19" />
    <path d="M8 22h8" />
    <path d="M8 22v-3h8v3" />
  </svg>
);

export const WaterDrop: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2c0 0-6 7-6 12a6 6 0 0 0 12 0c0-5-6-12-6-12z" />
    <path d="M9 15a2 2 0 0 0 2 2" />
  </svg>
);

export const Splash: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 15c-2 0-3.5 1-5 2s-3 2-5 2" />
    <path d="M12 15c2 0 3.5 1 5 2s3 2 5 2" />
    <path d="M12 15v-5" />
    <path d="M8 6l-2-4" />
    <path d="M12 4V2" />
    <path d="M16 6l2-4" />
    <path d="M6 10l-3-1" />
    <path d="M18 10l3-1" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const SwimCap: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 14c0-5.5 3.5-10 8-10s8 4.5 8 10" />
    <path d="M4 14c0 2 2 4 4 4h8c2 0 4-2 4-4" />
    <path d="M8 10c1-1 2.5-1.5 4-1.5s3 .5 4 1.5" />
    <circle cx="8" cy="13" r="1" />
    <circle cx="16" cy="13" r="1" />
  </svg>
);

export const Kickboard: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 8h16c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2z" />
    <path d="M6 8v8" />
    <path d="M18 8v8" />
    <path d="M2 12h20" />
    <circle cx="6" cy="12" r="1.5" />
    <circle cx="18" cy="12" r="1.5" />
  </svg>
);

export const Medal: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="15" r="6" />
    <path d="M9 2h6" />
    <path d="M12 2v4" />
    <path d="M8 6l4 3 4-3" />
    <path d="M12 13v4" />
    <path d="M10 15h4" />
  </svg>
);

export const LifeRing: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="3" x2="12" y2="8" />
    <line x1="12" y1="16" x2="12" y2="21" />
    <line x1="3" y1="12" x2="8" y2="12" />
    <line x1="16" y1="12" x2="21" y2="12" />
  </svg>
);

export const Whistle: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M10 12h8a4 4 0 0 1 0 8H10a6 6 0 0 1 0-12" />
    <circle cx="14" cy="16" r="2" />
    <path d="M10 12V8l-6-4" />
    <path d="M4 4l2 1.5" />
    <circle cx="6" cy="16" r="1" fill="currentColor" />
  </svg>
);

// Export all icons as a collection for easy import
export const SwimmingIcons = {
  SwimmerFreestyle,
  SwimmerBackstroke,
  SwimmerButterfly,
  WaterWaves,
  PoolLane,
  Stopwatch,
  Goggles,
  Trophy,
  WaterDrop,
  Splash,
  SwimCap,
  Kickboard,
  Medal,
  LifeRing,
  Whistle,
};

export default SwimmingIcons;
