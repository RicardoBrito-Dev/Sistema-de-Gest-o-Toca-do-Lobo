import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';
import { ctoxColors } from './src/tokens/ctox/ctox-colors';
import { fonts } from './src/tokens/base/fonts';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ...ctoxColors,
        // Acento de marca = laranja do raio da logo (sobrescreve o secondary verde do ctox)
        secondary: { DEFAULT: '#3a83e2', 700: 'rgba(58, 111, 226, 0.5)' },
        // Paleta da logo "Toca do Lobo"
        brand: '#3a83e2',
        'brand-gold': '#3a83e2',
        'brand-olive': '#1c2427',
        'brand-cream': '#d3daec',
        // Tokens semânticos de superfície (trocam no .dark via CSS vars)
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-fg': 'rgb(var(--surface-fg) / <alpha-value>)',
        'surface-muted': 'rgb(var(--surface-muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
      },
      fontFamily: {
        highlight: fonts.highlight,
        body: fonts.body,
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
