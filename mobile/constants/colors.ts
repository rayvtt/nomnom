// NomNom design system — mirrors the landing page CSS variables
export const Colors = {
  dark: {
    bg: '#050505',
    bg2: '#0A0A0A',
    bg3: '#111111',
    text: '#F5F0E4',
    text2: '#8A8070',
    text3: '#4A4540',
    accent: '#FF6A28',   // protein / primary CTAs
    accent2: '#FF9F1C',  // good carbs / secondary
    green: '#34D399',    // fat / healthy scores
    greenDim: '#1A6B4D',
    red: '#EF4444',      // bad carbs / warnings
    purple: '#A78BFA',   // B2B / AI features
    blue: '#60A5FA',     // informational
    cardBg: 'rgba(255,255,255,0.03)',
    cardBorder: 'rgba(255,255,255,0.06)',
  },
  light: {
    bg: '#FAFAF7',
    bg2: '#F0EDE6',
    bg3: '#E8E4DC',
    text: '#1A1814',
    text2: '#6B6560',
    text3: '#9A948E',
    accent: '#FF6A28',
    accent2: '#FF9F1C',
    green: '#34D399',
    greenDim: '#1A6B4D',
    red: '#EF4444',
    purple: '#A78BFA',
    blue: '#60A5FA',
    cardBg: 'rgba(0,0,0,0.03)',
    cardBorder: 'rgba(0,0,0,0.06)',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = typeof Colors.dark;
