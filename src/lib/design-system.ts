// Design system tokens based on Stitch "Cinematic Intelligence" design system

// Design system tokens based on Stitch "Cinematic Intelligence" design system
export const designTokens = {
  colors: {
    // Background layers
    background: '#111415',
    surface: '#1d2021',
    surfaceHigh: '#282a2b',
    surfaceContainerLowest: '#0c0f10',
    surfaceContainerLow: '#191c1d',
    surfaceContainerHigh: '#323536',
    
    // Typography
    textMain: '#e1e3e4',
    textSecondary: '#ccc3d8',
    
    // Accents
    primary: '#d2bbff',
    primaryContainer: '#7c3aed',
    primaryFixed: '#eaddff',
    outline: '#958da1',
    outlineVariant: '#4a4455',
    
    // Other
    error: '#ffb4ab',
  },
  spacing: {
    unit: 4,
    containerMax: 1280,
    gutterDesktop: 24,
    marginMobile: 20,
  },
  radius: {
    sm: '0.25rem',
    DEFAULT: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
  },
  typography: {
    // Hanken Grotesk for headings
    hanken: {
      family: "'Hanken Grotesk', sans-serif",
      weights: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
    // Inter for body text
    inter: {
      family: "'Inter', sans-serif",
      weights: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
    sizes: {
      displayLg: {
        fontSize: '64px',
        lineHeight: '72px',
        fontWeight: '600' as const,
        letterSpacing: '-0.02em' as const,
      },
      displayLgMobile: {
        fontSize: '40px',
        lineHeight: '48px',
        fontWeight: '600' as const,
        letterSpacing: '-0.02em' as const,
      },
      headlineMd: {
        fontSize: '32px',
        lineHeight: '40px',
        fontWeight: '500' as const,
        letterSpacing: '-0.01em' as const,
      },
      headlineSm: {
        fontSize: '24px',
        lineHeight: '32px',
        fontWeight: '500' as const,
        letterSpacing: '0em' as const,
      },
      bodyLg: {
        fontSize: '18px',
        lineHeight: '28px',
        fontWeight: '400' as const,
      },
      bodyMd: {
        fontSize: '16px',
        lineHeight: '24px',
        fontWeight: '400' as const,
      },
      bodySm: {
        fontSize: '14px',
        lineHeight: '20px',
        fontWeight: '400' as const,
      },
      labelCaps: {
        fontSize: '12px',
        lineHeight: '16px',
        fontWeight: '600' as const,
        letterSpacing: '0.1em' as const,
      },
    },
  },
  shadows: {
    subtle: '0 1px 2px rgba(0, 0, 0, 0.1), 0 1px 3px 1px rgba(0, 0, 0, 0.08)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.08)',
    strong: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
    glowPrimary: '0 0 20px rgba(124, 58, 237, 0.15)',
  },
} as const;

// Font family CSS
export const fontFamilies = {
  hanken: `
    @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700&display=swap');
  `,
  inter: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  `,
};

// Helper to create spacing utility
export const spacing = (units: number): string => `${units * designTokens.spacing.unit}px`;

// Helper to create responsive padding (string return for Tailwind classes)
export const containerPaddingClass = (mobile: number = 20, desktop: number = 24): string => {
  return `px-${mobile} md:px-${desktop}`;
};

// Default type definitions for styled-components if needed
export type SpacingValue = `${number}rem` | `${number}px`;
