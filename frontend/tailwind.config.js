/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'pop': '4px 4px 0px #063d27',
        'pop-sm': '2px 2px 0px #063d27',
        'pop-lg': '6px 6px 0px #063d27',
        'pop-gold': '4px 4px 0px #d97706',
        'pop-emerald': '4px 4px 0px #064e3b',
        'soft': '0 4px 24px rgba(6, 61, 39, 0.08)',
      },
      animation: {
        'float-slow': 'floatSlow 4s infinite ease-in-out',
        'float-reverse': 'floatReverse 4.5s infinite ease-in-out',
        'pulse-glow': 'pulseGlow 3s infinite ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'road-pulse': 'roadPulse 2s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};
