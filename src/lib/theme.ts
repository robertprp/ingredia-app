import { DarkTheme, DefaultTheme, type Theme } from 'expo-router/react-navigation';

export const THEME = {
  light: {
    background: 'hsl(48 33% 97%)', foreground: 'hsl(148 24% 11%)',
    card: 'hsl(0 0% 100%)', cardForeground: 'hsl(148 24% 11%)',
    popover: 'hsl(0 0% 100%)', popoverForeground: 'hsl(148 24% 11%)',
    primary: 'hsl(153 67% 28%)', primaryForeground: 'hsl(0 0% 100%)',
    secondary: 'hsl(146 39% 93%)', secondaryForeground: 'hsl(154 69% 21%)',
    muted: 'hsl(96 19% 95%)', mutedForeground: 'hsl(144 8% 39%)',
    accent: 'hsl(146 39% 93%)', accentForeground: 'hsl(154 69% 21%)',
    destructive: 'hsl(4 76% 40%)', destructiveForeground: 'hsl(0 0% 100%)',
    border: 'hsl(111 11% 88%)', input: 'hsl(111 11% 88%)', ring: 'hsl(221 83% 53%)',
    riskLow: 'hsl(153 67% 28%)', riskCaution: 'hsl(39 100% 30%)',
    riskHigh: 'hsl(4 76% 40%)', riskVeryHigh: 'hsl(3 64% 29%)', evidence: 'hsl(212 48% 37%)',
    chart1: 'hsl(153 67% 28%)', chart2: 'hsl(212 48% 37%)', chart3: 'hsl(39 100% 30%)',
    chart4: 'hsl(4 76% 40%)', chart5: 'hsl(144 8% 39%)',
    radius: '1rem',
  },
  dark: {
    background: 'hsl(147 24% 7%)', foreground: 'hsl(140 16% 96%)',
    card: 'hsl(144 21% 9%)', cardForeground: 'hsl(140 16% 96%)',
    popover: 'hsl(144 21% 9%)', popoverForeground: 'hsl(140 16% 96%)',
    primary: 'hsl(148 51% 56%)', primaryForeground: 'hsl(147 24% 7%)',
    secondary: 'hsl(148 18% 16%)', secondaryForeground: 'hsl(140 16% 96%)',
    muted: 'hsl(148 18% 16%)', mutedForeground: 'hsl(135 9% 74%)',
    accent: 'hsl(148 18% 16%)', accentForeground: 'hsl(140 16% 96%)',
    destructive: 'hsl(0 91% 71%)', destructiveForeground: 'hsl(147 24% 7%)',
    border: 'hsl(142 16% 24%)', input: 'hsl(142 16% 24%)', ring: 'hsl(211 78% 71%)',
    riskLow: 'hsl(148 51% 56%)', riskCaution: 'hsl(40 89% 61%)',
    riskHigh: 'hsl(0 91% 71%)', riskVeryHigh: 'hsl(351 95% 71%)', evidence: 'hsl(211 78% 71%)',
    chart1: 'hsl(148 51% 56%)', chart2: 'hsl(211 78% 71%)', chart3: 'hsl(40 89% 61%)',
    chart4: 'hsl(0 91% 71%)', chart5: 'hsl(135 9% 74%)',
    radius: '1rem',
  },
} as const;

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
