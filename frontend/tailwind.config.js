export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter'", 'sans-serif'],
        display: ["'Plus Jakarta Sans'", 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff',
          300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7',
          600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87',
        },
        accent: {
          pink: '#ec4899', orange: '#f97316', cyan: '#06b6d4',
          green: '#10b981', yellow: '#f59e0b',
        },
        dark: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0',
          300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b',
          600: '#475569', 700: '#334155', 800: '#1e293b',
          900: '#0f172a', 950: '#020617',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-pink': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'gradient-green': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'gradient-orange': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      },
      boxShadow: {
        glow: '0 0 20px rgba(168, 85, 247, 0.4)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.4)',
        card: '0 4px 24px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { '0%': { opacity: '0', transform: 'translateX(-8px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
    },
  },
  plugins: [],
};
