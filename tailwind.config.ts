import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['LINE Seed Sans TH', 'sans-serif'], mono: ['DM Mono', 'monospace'] },
      colors: { holo: { 950: '#0d0918', 900: '#151025', 500: '#a855f7', 400: '#c084fc', 300: '#e879f9' } },
      boxShadow: { holo: '0 0 32px rgba(168,85,247,.24)' },
      keyframes: { holoFloat: { '0%,100%': { transform: 'translateY(0) rotate(0deg)' }, '50%': { transform: 'translateY(-10px) rotate(2deg)' } } },
      animation: { 'holo-float': 'holoFloat 5s ease-in-out infinite' },
    },
  },
  plugins: [],
};
export default config;
