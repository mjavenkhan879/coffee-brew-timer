/**
 * WARM_EARTHY preset copy + the 2 declared accent overrides (design doc).
 * `name` is the preset value verbatim — never invent a new one.
 */

/** Keeps gradient stops as a mutable string[] so they can be handed to LinearGradient
 *  while the rest of the theme stays `as const`. */
const grad = (...stops: string[]): string[] => stops;

export const theme = {
  name: 'warm-earthy',

  colors: {
    bg: '#FAF5EC',
    surface: '#F2EAD8',
    surfaceAlt: '#E8DDC4',
    border: '#D8C9A8',
    borderStrong: '#E0D2B4',

    primary: '#D97B4D',
    primaryDeep: '#C25F31',
    primaryLight: '#E8A06B',

    secondary: '#7FA46B',
    secondaryDeep: '#6B9158',

    mustard: '#D9B36C',
    walnut: '#6B5740',

    /* override 1 — brief primary, used only for the complete tick / finished ring */
    success: '#3CAB2A',

    /* override 2 — deep roast-dark, every heading and value on light surfaces */
    textPrimary: '#1A2418',
    textSecondary: '#8A7A62',
    textMuted: 'rgba(26,36,24,0.45)',
    textOnDark: '#FAF5EC',
    textOnDarkDim: 'rgba(250,245,236,0.62)',

    darkWash: 'rgba(26,36,24,0.86)',
    glassDark: 'rgba(250,245,236,0.07)',
    glassDarkBorder: 'rgba(250,245,236,0.16)',
    hairline: 'rgba(217,123,77,0.40)',
  },

  gradients: {
    cta: grad('#E08A52', '#D97B4D', '#C25F31'),
    ctaSage: grad('#8FB578', '#7FA46B', '#6B9158'),
    chipActive: grad('#D97B4D', '#C4663B'),
    progress: grad('#D97B4D', '#E8A06B'),
    surface: grad('#F2EAD8', '#E8DDC4'),

    loaderOverlay: grad('rgba(26,36,24,0.93)', 'rgba(43,32,24,0.90)', 'rgba(26,36,24,0.96)'),
    menuFade: grad('rgba(250,245,236,0)', 'rgba(250,245,236,0.28)', '#FAF5EC'),
    lightOverlay: grad('rgba(250,245,236,0.90)', 'rgba(242,234,216,0.96)', 'rgba(232,221,196,0.97)'),
    brewOverlay: grad('rgba(26,36,24,0.74)', 'rgba(43,32,24,0.84)', 'rgba(26,36,24,0.91)'),
    resultOverlay: grad('rgba(127,164,107,0.44)', 'rgba(250,245,236,0.93)', '#F2EAD8'),
    panelOverlay: grad('rgba(250,245,236,0.93)', 'rgba(242,234,216,0.97)', 'rgba(232,221,196,0.98)'),
  },

  radius: { sm: 8, md: 12, lg: 16, xl: 20, sheet: 28, full: 999 },

  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },

  /* warm brown shadows — never black; this is what sells the skeuomorphic read */
  shadows: {
    card: {
      shadowColor: '#5A3A22',
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 5 },
      elevation: 4,
    },
    sheet: {
      shadowColor: '#5A3A22',
      shadowOpacity: 0.18,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: -6 },
      elevation: 12,
    },
    cta: {
      shadowColor: '#A84A22',
      shadowOpacity: 0.42,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 7 },
      elevation: 10,
    },
    ctaSage: {
      shadowColor: '#3F6B2E',
      shadowOpacity: 0.36,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 7 },
      elevation: 10,
    },
  },

  type: {
    hero: { fontSize: 40, fontWeight: '800' as const, letterSpacing: 4 },
    title: { fontSize: 26, fontWeight: '800' as const, letterSpacing: 1.2 },
    section: { fontSize: 17, fontWeight: '700' as const, letterSpacing: 0.4 },
    body: { fontSize: 15, fontWeight: '600' as const, letterSpacing: 0.2 },
    caption: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 2 },
  },
} as const;

export type Theme = typeof theme;
export default theme;
