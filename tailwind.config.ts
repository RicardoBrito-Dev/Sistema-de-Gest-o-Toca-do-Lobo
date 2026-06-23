import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';
import { ctoxColors } from './src/tokens/ctox/ctox-colors';
import { fonts } from './src/tokens/base/fonts';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,html}'],
  // Preflight desligado para coexistir com o style.css legado durante a migração incremental.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: { ...ctoxColors },
      fontFamily: {
        highlight: fonts.highlight,
        body: fonts.body,
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
