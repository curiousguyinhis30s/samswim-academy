/**
 * SamSwim Academy Design System Constants
 * A comprehensive design system for a modern swimming academy
 */

// =============================================================================
// COLORS
// =============================================================================

export const COLORS = {
  // Primary - Teal (Trust, Calm, Professionalism)
  primary: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6', // Main primary
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
    950: '#042F2E',
  },

  // Secondary - Turquoise/Cyan (Water, Freshness, Energy)
  secondary: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4', // Main secondary
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
    950: '#083344',
  },

  // Accent - Coral/Orange (CTAs, Energy, Excitement)
  accent: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316', // Main accent
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
    950: '#431407',
  },

  // Success - Emerald (Achievement, Progress, Certification)
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Main success
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    950: '#022C22',
  },

  // Warning - Amber
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#451A03',
  },

  // Error - Rose
  error: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E',
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
    950: '#4C0519',
  },

  // Water - Custom palette for swimming themes
  water: {
    deep: '#0C4A6E', // Deep pool
    mid: '#0369A1', // Mid-depth
    surface: '#0EA5E9', // Surface shimmer
    shallow: '#38BDF8', // Shallow water
    foam: '#BAE6FD', // Foam/bubbles
    splash: '#E0F2FE', // Light splash
  },

  // Neutral - Slate (Text, Backgrounds, Borders)
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
} as const;

// =============================================================================
// GRADIENTS
// =============================================================================

export const GRADIENTS = {
  // Ocean gradient for hero sections
  ocean: {
    light: 'linear-gradient(135deg, #ECFEFF 0%, #CFFAFE 50%, #A5F3FC 100%)',
    default: 'linear-gradient(135deg, #06B6D4 0%, #14B8A6 50%, #0D9488 100%)',
    dark: 'linear-gradient(135deg, #164E63 0%, #134E4A 50%, #0C4A6E 100%)',
    radial: 'radial-gradient(ellipse at center, #06B6D4 0%, #14B8A6 50%, #0D9488 100%)',
  },

  // Teal gradient for buttons and interactive elements
  teal: {
    light: 'linear-gradient(135deg, #5EEAD4 0%, #2DD4BF 100%)',
    default: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
    dark: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
    hover: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)',
  },

  // Sunset gradient for special CTAs
  sunset: {
    light: 'linear-gradient(135deg, #FED7AA 0%, #FDBA74 50%, #FB923C 100%)',
    default: 'linear-gradient(135deg, #F97316 0%, #EA580C 50%, #C2410C 100%)',
    warm: 'linear-gradient(135deg, #FBBF24 0%, #F97316 50%, #EA580C 100%)',
    vibrant: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #E11D48 100%)',
  },

  // Glass effect for glassmorphism
  glass: {
    light: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
    default: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)',
    dark: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.7) 100%)',
    frosted: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)',
  },

  // Water shimmer effect
  waterShimmer: {
    default: 'linear-gradient(180deg, #0EA5E9 0%, #06B6D4 25%, #14B8A6 50%, #06B6D4 75%, #0EA5E9 100%)',
    surface: 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
  },

  // Text gradients
  text: {
    ocean: 'linear-gradient(135deg, #06B6D4 0%, #14B8A6 100%)',
    sunset: 'linear-gradient(135deg, #F97316 0%, #F43F5E 100%)',
    premium: 'linear-gradient(135deg, #FBBF24 0%, #F97316 100%)',
  },
} as const;

// =============================================================================
// SHADOWS
// =============================================================================

export const SHADOWS = {
  // Soft shadows for subtle elevation
  soft: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
  },

  // Medium shadows for cards and modals
  medium: {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },

  // Strong shadows for prominent elements
  strong: {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.15), 0 1px 2px -1px rgba(0, 0, 0, 0.15)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -2px rgba(0, 0, 0, 0.15)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -4px rgba(0, 0, 0, 0.15)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  // Glow effects for interactive states
  glow: {
    primary: '0 0 20px rgba(20, 184, 166, 0.4), 0 0 40px rgba(20, 184, 166, 0.2)',
    secondary: '0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2)',
    accent: '0 0 20px rgba(249, 115, 22, 0.4), 0 0 40px rgba(249, 115, 22, 0.2)',
    success: '0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2)',
  },

  // Card-specific shadows
  card: {
    default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    hover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    active: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    elevated: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },

  // Button-specific shadows
  button: {
    default: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    hover: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    active: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    primary: '0 4px 14px 0 rgba(20, 184, 166, 0.4)',
    accent: '0 4px 14px 0 rgba(249, 115, 22, 0.4)',
  },

  // Inner shadows
  inner: {
    sm: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    lg: 'inset 0 4px 6px 0 rgba(0, 0, 0, 0.1)',
  },
} as const;

// =============================================================================
// ANIMATIONS
// =============================================================================

export const ANIMATIONS = {
  // Duration values
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms',
  },

  // Easing functions
  easing: {
    linear: 'linear',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)', // Default smooth
    smoothIn: 'cubic-bezier(0.4, 0, 1, 1)',
    smoothOut: 'cubic-bezier(0, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    bounceIn: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
    bounceOut: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    snap: 'cubic-bezier(0.16, 1, 0.3, 1)',
    elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Stagger delays for sequential animations
  stagger: {
    fast: '50ms',
    normal: '100ms',
    slow: '150ms',
    slower: '200ms',
  },

  // Pre-built transitions
  transition: {
    default: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: '500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Keyframe animation names (for use with CSS animations)
  keyframes: {
    fadeIn: 'fadeIn',
    fadeOut: 'fadeOut',
    slideUp: 'slideUp',
    slideDown: 'slideDown',
    slideLeft: 'slideLeft',
    slideRight: 'slideRight',
    scaleIn: 'scaleIn',
    scaleOut: 'scaleOut',
    spin: 'spin',
    pulse: 'pulse',
    bounce: 'bounce',
    wave: 'wave', // Water wave effect
    ripple: 'ripple', // Water ripple effect
    float: 'float', // Floating effect
    shimmer: 'shimmer', // Shimmer effect
  },
} as const;

// =============================================================================
// SPACING
// =============================================================================

export const SPACING = {
  // Base unit (4px)
  base: 4,

  // Section padding
  section: {
    xs: '2rem', // 32px
    sm: '3rem', // 48px
    md: '4rem', // 64px
    lg: '6rem', // 96px
    xl: '8rem', // 128px
    '2xl': '10rem', // 160px
  },

  // Card padding
  card: {
    xs: '0.75rem', // 12px
    sm: '1rem', // 16px
    md: '1.5rem', // 24px
    lg: '2rem', // 32px
    xl: '2.5rem', // 40px
  },

  // Button padding
  button: {
    xs: '0.5rem 0.75rem', // 8px 12px
    sm: '0.625rem 1rem', // 10px 16px
    md: '0.75rem 1.5rem', // 12px 24px
    lg: '1rem 2rem', // 16px 32px
    xl: '1.25rem 2.5rem', // 20px 40px
  },

  // Gap sizes for flex/grid
  gap: {
    xs: '0.5rem', // 8px
    sm: '0.75rem', // 12px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
  },

  // Container max-widths
  container: {
    xs: '20rem', // 320px
    sm: '24rem', // 384px
    md: '28rem', // 448px
    lg: '32rem', // 512px
    xl: '36rem', // 576px
    '2xl': '42rem', // 672px
    '3xl': '48rem', // 768px
    '4xl': '56rem', // 896px
    '5xl': '64rem', // 1024px
    '6xl': '72rem', // 1152px
    '7xl': '80rem', // 1280px
    full: '100%',
  },

  // Inline spacing
  inline: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '0.75rem', // 12px
    lg: '1rem', // 16px
    xl: '1.5rem', // 24px
  },

  // Stack spacing (vertical)
  stack: {
    xs: '0.5rem', // 8px
    sm: '0.75rem', // 12px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
  },
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const TYPOGRAPHY = {
  // Font families
  fontFamily: {
    sans: '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    heading: '"Plus Jakarta Sans", "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    display: '"Outfit", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
  },

  // Font sizes
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem', // 72px
    '8xl': '6rem', // 96px
    '9xl': '8rem', // 128px
  },

  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
    // Specific values
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    7: '1.75rem', // 28px
    8: '2rem', // 32px
    9: '2.25rem', // 36px
    10: '2.5rem', // 40px
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Pre-defined text styles
  textStyle: {
    // Headings
    h1: {
      fontSize: '3.75rem', // 60px
      lineHeight: '1',
      fontWeight: '800',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '3rem', // 48px
      lineHeight: '1',
      fontWeight: '700',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '2.25rem', // 36px
      lineHeight: '1.1',
      fontWeight: '700',
      letterSpacing: '-0.02em',
    },
    h4: {
      fontSize: '1.875rem', // 30px
      lineHeight: '1.2',
      fontWeight: '600',
      letterSpacing: '-0.01em',
    },
    h5: {
      fontSize: '1.5rem', // 24px
      lineHeight: '1.25',
      fontWeight: '600',
      letterSpacing: '0',
    },
    h6: {
      fontSize: '1.25rem', // 20px
      lineHeight: '1.3',
      fontWeight: '600',
      letterSpacing: '0',
    },
    // Body text
    bodyLg: {
      fontSize: '1.125rem', // 18px
      lineHeight: '1.625',
      fontWeight: '400',
    },
    body: {
      fontSize: '1rem', // 16px
      lineHeight: '1.5',
      fontWeight: '400',
    },
    bodySm: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.5',
      fontWeight: '400',
    },
    // UI text
    label: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.25',
      fontWeight: '500',
      letterSpacing: '0.025em',
    },
    caption: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1.25',
      fontWeight: '400',
    },
    overline: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1',
      fontWeight: '600',
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
    },
  },
} as const;

// =============================================================================
// RADII (Border Radius)
// =============================================================================

export const RADII = {
  none: '0',
  sm: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
  // Component-specific
  button: '0.5rem', // 8px
  card: '1rem', // 16px
  modal: '1.5rem', // 24px
  input: '0.5rem', // 8px
  badge: '9999px',
  avatar: '9999px',
  chip: '9999px',
} as const;

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  // Numeric values for JS usage
  values: {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
} as const;

// =============================================================================
// Z-INDEX
// =============================================================================

export const Z_INDEX = {
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  max: 9999,
} as const;

// =============================================================================
// BORDERS
// =============================================================================

export const BORDERS = {
  width: {
    none: '0',
    thin: '1px',
    medium: '2px',
    thick: '4px',
  },
  style: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
    none: 'none',
  },
  color: {
    default: COLORS.neutral[200],
    muted: COLORS.neutral[100],
    strong: COLORS.neutral[300],
    primary: COLORS.primary[500],
    secondary: COLORS.secondary[500],
    accent: COLORS.accent[500],
    success: COLORS.success[500],
    error: COLORS.error[500],
  },
} as const;

// =============================================================================
// COMBINED DESIGN OBJECT
// =============================================================================

export const DESIGN = {
  colors: COLORS,
  gradients: GRADIENTS,
  shadows: SHADOWS,
  animations: ANIMATIONS,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  radii: RADII,
  breakpoints: BREAKPOINTS,
  zIndex: Z_INDEX,
  borders: BORDERS,
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Colors = typeof COLORS;
export type Gradients = typeof GRADIENTS;
export type Shadows = typeof SHADOWS;
export type Animations = typeof ANIMATIONS;
export type Spacing = typeof SPACING;
export type Typography = typeof TYPOGRAPHY;
export type Radii = typeof RADII;
export type Breakpoints = typeof BREAKPOINTS;
export type ZIndex = typeof Z_INDEX;
export type Borders = typeof BORDERS;
export type Design = typeof DESIGN;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get a color value by path (e.g., 'primary.500')
 */
export function getColor(path: string): string {
  const [colorKey, shade] = path.split('.');
  const colorGroup = COLORS[colorKey as keyof typeof COLORS];
  if (typeof colorGroup === 'object' && shade) {
    return colorGroup[shade as keyof typeof colorGroup] || '';
  }
  return '';
}

/**
 * Create a CSS custom property reference
 */
export function cssVar(name: string): string {
  return `var(--${name})`;
}

/**
 * Generate CSS custom properties from the design system
 */
export function generateCSSVariables(): Record<string, string> {
  const variables: Record<string, string> = {};

  // Colors
  Object.entries(COLORS).forEach(([colorName, shades]) => {
    if (typeof shades === 'object') {
      Object.entries(shades).forEach(([shade, value]) => {
        variables[`--color-${colorName}-${shade}`] = value;
      });
    }
  });

  // Spacing
  Object.entries(SPACING.gap).forEach(([size, value]) => {
    variables[`--spacing-${size}`] = value;
  });

  // Radii
  Object.entries(RADII).forEach(([size, value]) => {
    variables[`--radius-${size}`] = value;
  });

  return variables;
}

export default DESIGN;
