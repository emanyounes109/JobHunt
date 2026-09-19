export const COLORS = {
  primary: '#3D5A73',
  accent: '#F0A868',
  backgroundLight: '#FAF9F6',
  backgroundDark: '#151C24',
  success: '#6B9080',
  danger: '#C97064',
  neutral: '#8B9694',
} as const;

export type ColorToken = keyof typeof COLORS;