/**
 * Theme Tokens - JavaScript object-based references
 * These mirror the CSS variables in theme.css for programmatic access
 */

export interface ThemeTokenSet {
  // Backgrounds
  bgApp: string;
  bgSurface: string;
  bgHover: string;
  bgActive: string;

  // Gradients
  gradientTop: string;
  gradientBottom: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textLink: string;

  // Accent
  accentColor: string;
  accentHover: string;
  accentFocusRing: string;

  // Border & Shadow
  borderColor: string;
  shadowColor: string;

  // Radius
  radiusCard: string;
  radiusInput: string;
  radiusButton: string;
}

export const lightTokens: ThemeTokenSet = {
  // Backgrounds
  bgApp: '#f6f6f6',
  bgSurface: '#ffffff',
  bgHover: '#f0f0f0',
  bgActive: '#e8f0fe',

  // Gradients
  gradientTop: '#2d0b5e',
  gradientBottom: '#6b21a8',

  // Text
  textPrimary: '#0f0f0f',
  textSecondary: '#555555',
  textLink: '#1a73e8',

  // Accent
  accentColor: '#1a73e8',
  accentHover: '#1557b0',
  accentFocusRing: 'rgba(26, 115, 232, 0.2)',

  // Border & Shadow
  borderColor: '#e0e0e0',
  shadowColor: 'rgba(0, 0, 0, 0.08)',

  // Radius
  radiusCard: '1.5rem',
  radiusInput: '0.5rem',
  radiusButton: '0.5rem',
};

export const darkTokens: ThemeTokenSet = {
  // Backgrounds
  bgApp: '#1e1e1e',
  bgSurface: '#2a2a2a',
  bgHover: '#333333',
  bgActive: '#1a3a5c',

  // Gradients
  gradientTop: '#2d0b5e',
  gradientBottom: '#6b21a8',

  // Text
  textPrimary: '#f6f6f6',
  textSecondary: '#aaaaaa',
  textLink: '#6db3f2',

  // Accent
  accentColor: '#6db3f2',
  accentHover: '#4a9ae0',
  accentFocusRing: 'rgba(109, 179, 242, 0.2)',

  // Border & Shadow
  borderColor: '#3a3a3a',
  shadowColor: 'rgba(0, 0, 0, 0.3)',

  // Radius
  radiusCard: '1.5rem',
  radiusInput: '0.5rem',
  radiusButton: '0.5rem',
};

export const themes: Record<string, ThemeTokenSet> = {
  light: lightTokens,
  dark: darkTokens,
};