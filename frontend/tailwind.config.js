/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          100: '#f3e8ff',
          300: '#c084fc', 400: '#a855f7', 500: '#9333ea',
          600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6',
          900: '#4c1d95', 950: '#2e1065',
        },
        dark: {
          50:  '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0',
          300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b',
          600: '#475569', 700: '#334155', 750: '#2a3547',
          800: '#1e293b', 850: '#172032', 900: '#0f172a',
          950: '#080f1e',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #7c3aed 0%, #9333ea 45%, #a855f7 100%)',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in':  'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                  to: { opacity: '1' } },
        slideIn: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      boxShadow: {
        glow: '0 0 20px -5px #a855f740',
        'glow-sm': '0 0 12px -6px #a855f780',
        'card-hover': '0 20px 45px -20px rgba(168, 85, 247, 0.35)',
      },
    },
  },
  plugins: [],
};
