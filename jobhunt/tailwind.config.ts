import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3D5A73',
          hover: '#334B60',   // used by Button's hover state
          active: '#2C4152',
        },
        accent: '#F0A868',
        success: '#6B9080',
        danger: '#C97064',
        neutral: '#8B9694',
        background: {
          light: '#FAF9F6',
          dark: '#151C24',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1C242E',    // card surface in dark mode (lifted off the page)
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(21, 28, 36, 0.12)',
      },
    },
  },
  plugins: [],
} satisfies Config;