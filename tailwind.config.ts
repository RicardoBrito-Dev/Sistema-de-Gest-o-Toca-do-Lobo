import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';
import { ctoxColors } from './src/tokens/ctox/ctox-colors';
import { fonts } from './src/tokens/base/fonts';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,html}'],
  darkMode: 'class',
  // Preflight desligado para coexistir com o style.css legado durante a migração incremental.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        ...ctoxColors,
        // Acento de marca = laranja do raio da logo (sobrescreve o secondary verde do ctox)
        secondary: { DEFAULT: '#E2733A', 700: 'rgba(226,115,58,0.5)' },
        // Paleta da logo "Toca do Lobo"
        brand: '#E2733A',
        'brand-gold': '#C2A766',
        'brand-olive': '#23271C',
        'brand-cream': '#ECE6D3',
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
